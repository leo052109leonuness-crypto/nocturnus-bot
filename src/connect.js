import a, { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, fetchLatestWaWebVersion } from 'whaileys';
const makeWASocket = a.default;
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import pino from 'pino';
import fs from 'fs/promises';
import fsSync from 'fs';
import path, { dirname } from 'path';
import qrcode from 'qrcode-terminal';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── CARREGAR CONFIG ──────────────────────────────────────────────────────
const configPath = path.join(__dirname, 'config.json');
let config;

try {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (!config.prefixo || !config.nomebot || !config.numerodono) {
        throw new Error('Campos obrigatórios ausentes: prefixo, nomebot, numerodono');
    }
} catch (err) {
    console.error(`\n❌ Erro no config.json: ${err.message}`);
    console.error('💡 Execute: npm run config\n');
    process.exit(1);
}

// Importar handler de comandos
const indexModule = (await import('./index.js')).default ?? (await import('./index.js'));

const { nomebot, nomedono, numerodono, prefixo } = config;

const logger = pino({ level: 'silent' });
const AUTH_DIR = path.join(__dirname, 'database', 'session');

// Controle de reconexão
let isConnected = false;
let reconnectTimer = null;
let reconnectCount = 0;

function scheduleReconnect(useCode) {
    if (reconnectTimer) return; // já tem reconexão agendada
    reconnectCount++;
    // Delay progressivo: 5s, 10s, 20s, 30s (máximo)
    const delay = Math.min(5000 * reconnectCount, 30000);
    console.log(`🔄 Reconectando em ${delay / 1000}s... (tentativa ${reconnectCount})`);
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        startConnection(useCode);
    }, delay);
}

async function startConnection(useCode = false) {
    try {
        await fs.mkdir(AUTH_DIR, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
        // Usar a versão mais recente do WhatsApp Web para evitar erro 405
        let version;
        try {
            const result = await fetchLatestWaWebVersion();
            version = result.version;
            console.log(`📱 Versão WA Web: ${version.join('.')}`);
        } catch {
            const result = await fetchLatestBaileysVersion();
            version = result.version;
            console.log(`📱 Versão Baileys: ${version.join('.')}`);
        }

        const msgRetryCounterCache = new NodeCache({ stdTTL: 120 });
        const messagesCache = new NodeCache({ stdTTL: 300, maxKeys: 500 });

        const sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger,
            browser: ['NOCTURNUS', 'Chrome', '120.0.6099.71'],
            syncFullHistory: false,
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: false,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            retryRequestDelayMs: 3000,
            maxMsgRetryCount: 3,
            getMessage: async (key) => {
                const cached = messagesCache.get(key.id);
                return cached ? { conversation: cached } : { conversation: '' };
            },
            msgRetryCounterCache,
        });

        sock.ev.on('creds.update', saveCreds);

        // ─── CÓDIGO DE PAREAMENTO ─────────────────────────────────────────
        if (useCode && !sock.authState.creds.registered) {
            // Aguarda socket inicializar
            await new Promise(r => setTimeout(r, 3000));
            try {
                const code = await sock.requestPairingCode(numerodono);
                const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log('\n╔══════════════════════════════════╗');
                console.log('║  🔑 SEU CÓDIGO DE PAREAMENTO     ║');
                console.log('║                                  ║');
                console.log(`║        ${formatted.padEnd(24)}║`);
                console.log('║                                  ║');
                console.log('╚══════════════════════════════════╝');
                console.log('📱 WhatsApp > Aparelhos Conectados > Conectar com número\n');
            } catch (err) {
                console.error('❌ Erro ao gerar código:', err.message);
                console.log('💡 Tente usar QR Code: escolha opção 1 no próximo start\n');
            }
        }

        // ─── EVENTOS DE CONEXÃO ───────────────────────────────────────────
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('\n📱 Escaneie o QR Code com o WhatsApp:\n');
                qrcode.generate(qr, { small: true });
                console.log('\n⏳ O QR Code expira em 60 segundos. Escaneie rápido!\n');
            }

            if (connection === 'connecting') {
                console.log('🔄 Conectando...');
            }

            if (connection === 'open') {
                isConnected = true;
                reconnectCount = 0; // resetar contador ao conectar com sucesso
                console.log('\n╔══════════════════════════════════╗');
                console.log(`║  ✅ ${nomebot.padEnd(28)}║`);
                console.log(`║  👤 Dono: ${(nomedono || numerodono).slice(0, 22).padEnd(22)}║`);
                console.log(`║  🔣 Prefixo: ${prefixo.padEnd(19)}║`);
                console.log('╚══════════════════════════════════╝\n');
            }

            if (connection === 'close') {
                isConnected = false;
                const err = lastDisconnect?.error;
                const statusCode = (err instanceof Boom) ? err.output?.statusCode : err?.output?.statusCode;

                console.log(`⚠️ Conexão encerrada. Código: ${statusCode || 'desconhecido'}`);

                if (statusCode === DisconnectReason.loggedOut) {
                    console.log('❌ Você foi desconectado (logout).');
                    console.log('🗑️  Apague a pasta src/database/session e reinicie.');
                    process.exit(0);
                } else if (statusCode === DisconnectReason.badSession) {
                    console.log('❌ Sessão corrompida. Apague src/database/session e reinicie.');
                    process.exit(0);
                } else {
                    scheduleReconnect(useCode);
                }
            }
        });

        // ─── HANDLER DE MENSAGENS ─────────────────────────────────────────
        sock.ev.on('messages.upsert', async (m) => {
            try {
                if (!m.messages || m.type !== 'notify') return;
                const msg = m.messages[0];
                if (!msg?.message) return;

                // Cachear texto da mensagem
                const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
                if (text && msg.key?.id) messagesCache.set(msg.key.id, text);

                await indexModule(sock, msg, config);
            } catch (err) {
                console.error('❌ Erro ao processar mensagem:', err.message);
            }
        });

    } catch (err) {
        console.error('❌ Erro ao iniciar conexão:', err.message);
        scheduleReconnect(useCode);
    }
}

// ─── INICIAR ──────────────────────────────────────────────────────────────
const useCode = process.argv.includes('--code');
startConnection(useCode);
