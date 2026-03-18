import a, { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } from 'whaileys';
const makeWASocket = a.default;
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import readline from 'readline';
import pino from 'pino';
import fs from 'fs/promises';
import fsSync from 'fs';
import path, { dirname, join } from 'path';
import qrcode from 'qrcode-terminal';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = path.join(__dirname, 'config.json');
let config;

try {
    const configContent = readFileSync(configPath, 'utf8');
    config = JSON.parse(configContent);
    if (!config.prefixo || !config.nomebot || !config.numerodono) {
        throw new Error('Campos obrigatórios ausentes no config.json (prefixo, nomebot, numerodono)');
    }
} catch (err) {
    console.error(`❌ Erro ao carregar config.json: ${err.message}`);
    console.error('💡 Execute: npm run config');
    process.exit(1);
}

// Importar handler principal
const indexModule = (await import('./index.js')).default ?? (await import('./index.js'));

const { prefixo, nomebot, nomedono, numerodono, openaiKey } = config;

const logger = pino({ level: 'silent' });

const AUTH_DIR = path.join(__dirname, 'database', 'session');

let msgRetryCounterCache;
let messagesCache;

async function initializeCaches() {
    msgRetryCounterCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });
    messagesCache = new NodeCache({ stdTTL: 300, checkperiod: 60, maxKeys: 1000 });
}

async function connectToWhatsApp(useCode = false) {
    await initializeCaches();

    await fs.mkdir(AUTH_DIR, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        printQRInTerminal: false,
        logger,
        browser: [nomebot, 'Safari', '1.0.0'],
        syncFullHistory: false,
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: false,
        getMessage: async (key) => {
            const msg = messagesCache.get(key.id);
            return msg ? { conversation: msg } : { conversation: '' };
        },
        msgRetryCounterCache,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 Escaneie o QR Code abaixo com o WhatsApp:\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'connecting') {
            console.log('🔄 Conectando ao WhatsApp...');
        }

        if (connection === 'open') {
            const colors = {
                reset: '\x1b[0m', green: '\x1b[1;32m', cyan: '\x1b[1;36m',
                blue: '\x1b[1;34m', purple: '\x1b[1;35m', bold: '\x1b[1m',
            };
            console.log(`\n${colors.blue}════════════════════════════════════════${colors.reset}`);
            console.log(`${colors.green}${colors.bold}  ✅ ${nomebot} conectado com sucesso!${colors.reset}`);
            console.log(`${colors.cyan}  👤 Dono: ${nomedono}${colors.reset}`);
            console.log(`${colors.cyan}  🔣 Prefixo: ${prefixo}${colors.reset}`);
            console.log(`${colors.blue}════════════════════════════════════════${colors.reset}\n`);
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log('⚠️ Conexão perdida. Reconectando em 3s...');
                setTimeout(() => connectToWhatsApp(useCode), 3000);
            } else {
                console.log('❌ Sessão encerrada. Apague a pasta src/database/session e reinicie.');
                process.exit(0);
            }
        }
    });

    // Código de pareamento
    if (useCode && !sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const phoneNumber = await new Promise((resolve) => {
            rl.question('📱 Digite o número de telefone (com código do país, ex: 5511999999999): ', (num) => {
                rl.close();
                resolve(num.trim().replace(/\D/g, ''));
            });
        });
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\n🔑 Código de pareamento: ${code}`);
        console.log('📱 Vá em WhatsApp > Aparelhos Conectados > Conectar com número de telefone\n');
    }

    // Handler de mensagens
    sock.ev.on('messages.upsert', async (m) => {
        try {
            if (!m.messages || m.type !== 'notify') return;
            const msg = m.messages[0];
            if (!msg.message) return;

            // Cachear mensagem
            if (msg.key?.id) {
                const text = msg.message?.conversation ||
                    msg.message?.extendedTextMessage?.text || '';
                if (text) messagesCache.set(msg.key.id, text);
            }

            await indexModule(sock, msg, config);
        } catch (err) {
            console.error('❌ Erro ao processar mensagem:', err.message);
        }
    });

    return sock;
}

const useCode = process.argv.includes('--code');
connectToWhatsApp(useCode);
