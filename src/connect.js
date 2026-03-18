import a, { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } from 'whaileys';
const makeWASocket = a.default;
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import readline from 'readline';
import pino from 'pino';
import fs from 'fs/promises';
import fsSync from 'fs';
import path, { dirname } from 'path';
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
        throw new Error('Campos obrigatórios ausentes no config.json');
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

// Pedir número ANTES de conectar (apenas no modo código)
async function askPhoneNumber() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('📱 Digite seu número (com código do país, ex: 5511999999999): ', (num) => {
            rl.close();
            resolve(num.trim().replace(/\D/g, ''));
        });
    });
}

let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000; // máximo 30s entre tentativas

async function connectToWhatsApp(useCode = false, phoneNumber = null) {
    await fs.mkdir(AUTH_DIR, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const msgRetryCounterCache = new NodeCache({ stdTTL: 120, checkperiod: 60 });
    const messagesCache = new NodeCache({ stdTTL: 300, checkperiod: 60, maxKeys: 1000 });

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
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        retryRequestDelayMs: 2000,
        getMessage: async (key) => {
            const msg = messagesCache.get(key.id);
            return msg ? { conversation: msg } : { conversation: '' };
        },
        msgRetryCounterCache,
    });

    sock.ev.on('creds.update', saveCreds);

    // Solicitar código de pareamento APÓS socket criado mas ANTES da conexão abrir
    if (useCode && !sock.authState.creds.registered) {
        if (!phoneNumber) {
            phoneNumber = await askPhoneNumber();
        }
        if (phoneNumber && phoneNumber.length >= 10) {
            try {
                await new Promise(resolve => setTimeout(resolve, 2000)); // aguarda socket estabilizar
                const code = await sock.requestPairingCode(phoneNumber);
                const formatted = code.match(/.{1,4}/g)?.join('-') || code;
                console.log('\n╔══════════════════════════════════╗');
                console.log(`║  🔑 CÓDIGO DE PAREAMENTO         ║`);
                console.log(`║                                  ║`);
                console.log(`║     ${formatted.padEnd(28)}║`);
                console.log(`║                                  ║`);
                console.log('╚══════════════════════════════════╝');
                console.log('📱 Vá em: WhatsApp > Aparelhos Conectados > Conectar com número\n');
            } catch (err) {
                console.error('❌ Erro ao solicitar código:', err.message);
            }
        }
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n📱 Escaneie o QR Code abaixo:\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'connecting') {
            console.log('🔄 Conectando ao WhatsApp...');
        }

        if (connection === 'open') {
            reconnectAttempts = 0; // resetar tentativas ao conectar
            console.log('\n╔══════════════════════════════════╗');
            console.log(`║  ✅ ${nomebot} conectado!          ║`);
            console.log(`║  👤 Dono: ${(nomedono || '').slice(0, 20).padEnd(20)}  ║`);
            console.log(`║  🔣 Prefixo: ${prefixo.padEnd(18)}  ║`);
            console.log('╚══════════════════════════════════╝\n');
        }

        if (connection === 'close') {
            const statusCode = (lastDisconnect?.error)?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                reconnectAttempts++;
                // Delay progressivo: 3s, 6s, 12s... até 30s máximo
                const delay = Math.min(3000 * Math.pow(1.5, reconnectAttempts - 1), MAX_RECONNECT_DELAY);
                console.log(`⚠️ Conexão perdida (tentativa ${reconnectAttempts}). Reconectando em ${Math.round(delay / 1000)}s...`);
                setTimeout(() => connectToWhatsApp(useCode, phoneNumber), delay);
            } else {
                console.log('❌ Sessão encerrada (logout). Apague a pasta src/database/session e reinicie.');
                process.exit(0);
            }
        }
    });

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

// Se modo código, pedir número ANTES de tudo
let phoneNumber = null;
if (useCode) {
    phoneNumber = await askPhoneNumber();
}

connectToWhatsApp(useCode, phoneNumber);
