#!/usr/bin/env node

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import readline from 'readline/promises';
import os from 'os';

const CONFIG_PATH = path.join(process.cwd(), 'src', 'config.json');
const NODE_MODULES_PATH = path.join(process.cwd(), 'node_modules');
const QR_CODE_DIR = path.join(process.cwd(), 'src', 'database', 'session');
const CONNECT_FILE = path.join(process.cwd(), 'src', 'connect.js');
const isWindows = os.platform() === 'win32';

const c = {
    reset: '\x1b[0m', green: '\x1b[1;32m', red: '\x1b[1;31m',
    blue: '\x1b[1;34m', yellow: '\x1b[1;33m', cyan: '\x1b[1;36m',
    bold: '\x1b[1m', purple: '\x1b[1;35m',
};

const log = {
    ok: (t) => console.log(`${c.green}${t}${c.reset}`),
    err: (t) => console.log(`${c.red}${t}${c.reset}`),
    info: (t) => console.log(`${c.cyan}${t}${c.reset}`),
    warn: (t) => console.log(`${c.yellow}${t}${c.reset}`),
    sep: () => console.log(`${c.blue}════════════════════════════════════════${c.reset}`),
};

let botProcess = null;

function displayBanner() {
    log.sep();
    console.log(`${c.purple}${c.bold}`);
    console.log('  ███╗   ██╗ ██████╗  ██████╗████████╗██╗   ██╗██████╗ ███╗   ██╗██╗   ██╗███████╗');
    console.log('  ████╗  ██║██╔═══██╗██╔════╝╚══██╔══╝██║   ██║██╔══██╗████╗  ██║██║   ██║██╔════╝');
    console.log('  ██╔██╗ ██║██║   ██║██║        ██║   ██║   ██║██████╔╝██╔██╗ ██║██║   ██║███████╗');
    console.log('  ██║╚██╗██║██║   ██║██║        ██║   ██║   ██║██╔══██╗██║╚██╗██║██║   ██║╚════██║');
    console.log('  ██║ ╚████║╚██████╔╝╚██████╗   ██║   ╚██████╔╝██║  ██║██║ ╚████║╚██████╔╝███████║');
    console.log('  ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝');
    console.log(`${c.reset}`);
    console.log(`${c.cyan}  🌙 Bot WhatsApp | RPG • Economia • IA • Admin${c.reset}`);
    log.sep();
    console.log();
}

function setupShutdown() {
    const shutdown = () => {
        log.warn('\n🛑 Encerrando NOCTURNUS...');
        if (botProcess) { botProcess.removeAllListeners(); botProcess.kill(); }
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

function startBot(codeMode = false) {
    const args = ['--expose-gc', CONNECT_FILE];
    if (codeMode) args.push('--code');

    botProcess = spawn('node', args, {
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' },
    });

    botProcess.on('error', (err) => {
        log.err(`❌ Erro: ${err.message}`);
        restartBot(codeMode);
    });

    botProcess.on('close', (code) => {
        if (code === 0) {
            log.info('✅ Bot encerrado normalmente.');
            process.exit(0);
        } else {
            log.warn(`⚠️ Bot encerrou com código ${code}. Reiniciando em 5s...`);
            restartBot(codeMode);
        }
    });
}

function restartBot(codeMode) {
    setTimeout(() => {
        if (botProcess) botProcess.removeAllListeners();
        startBot(codeMode);
    }, 5000);
}

async function checkSession() {
    try {
        if (!fsSync.existsSync(QR_CODE_DIR)) {
            await fs.mkdir(QR_CODE_DIR, { recursive: true });
            return false;
        }
        const files = await fs.readdir(QR_CODE_DIR);
        return files.length > 2;
    } catch { return false; }
}

async function promptMethod() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    // Ler número do config para mostrar ao usuário
    let numero = '';
    try {
        const cfg = JSON.parse(fsSync.readFileSync(CONFIG_PATH, 'utf8'));
        numero = cfg.numerodono || '';
    } catch { }

    console.log(`${c.yellow}🔧 Escolha o método de conexão:${c.reset}`);
    console.log(`${c.yellow}  1. 📷 QR Code (recomendado para internet instável)${c.reset}`);
    console.log(`${c.yellow}  2. 🔑 Código de pareamento${numero ? ` (número: ${numero})` : ''}${c.reset}`);
    console.log(`${c.yellow}  3. 🚪 Sair${c.reset}\n`);

    const answer = await rl.question('➡️ Opção: ');
    rl.close();

    switch (answer.trim()) {
        case '1': return 'qr';
        case '2': return 'code';
        case '3': log.ok('👋 Até logo!'); process.exit(0);
        default:
            log.warn('⚠️ Opção inválida. Usando QR Code.');
            return 'qr';
    }
}

async function main() {
    setupShutdown();
    displayBanner();

    if (!fsSync.existsSync(CONFIG_PATH)) {
        log.err('❌ config.json não encontrado!');
        log.info('💡 Execute primeiro: npm run config\n');
        process.exit(1);
    }

    const hasSession = await checkSession();
    if (hasSession) {
        log.ok('✅ Sessão salva detectada. Conectando automaticamente...\n');
        startBot(false);
        return;
    }

    const method = await promptMethod();
    console.log();
    startBot(method === 'code');
}

main().catch((err) => {
    console.error('❌ Erro fatal:', err.message);
    process.exit(1);
});
