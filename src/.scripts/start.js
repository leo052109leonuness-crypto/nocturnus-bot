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

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[1;32m',
  red: '\x1b[1;31m',
  blue: '\x1b[1;34m',
  yellow: '\x1b[1;33m',
  cyan: '\x1b[1;36m',
  bold: '\x1b[1m',
  purple: '\x1b[1;35m',
};

const print = {
  msg: (t) => console.log(`${colors.green}${t}${colors.reset}`),
  err: (t) => console.log(`${colors.red}${t}${colors.reset}`),
  info: (t) => console.log(`${colors.cyan}${t}${colors.reset}`),
  warn: (t) => console.log(`${colors.yellow}${t}${colors.reset}`),
  sep: () => console.log(`${colors.blue}════════════════════════════════════════${colors.reset}`),
};

let botProcess = null;

function displayBanner() {
  print.sep();
  console.log(`${colors.purple}${colors.bold}`);
  console.log(`  ███╗   ██╗ ██████╗  ██████╗████████╗██╗   ██╗██████╗ ███╗   ██╗██╗   ██╗███████╗`);
  console.log(`  ████╗  ██║██╔═══██╗██╔════╝╚══██╔══╝██║   ██║██╔══██╗████╗  ██║██║   ██║██╔════╝`);
  console.log(`  ██╔██╗ ██║██║   ██║██║        ██║   ██║   ██║██████╔╝██╔██╗ ██║██║   ██║███████╗`);
  console.log(`  ██║╚██╗██║██║   ██║██║        ██║   ██║   ██║██╔══██╗██║╚██╗██║██║   ██║╚════██║`);
  console.log(`  ██║ ╚████║╚██████╔╝╚██████╗   ██║   ╚██████╔╝██║  ██║██║ ╚████║╚██████╔╝███████║`);
  console.log(`  ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝`);
  console.log(`${colors.reset}`);
  console.log(`${colors.cyan}  🌙 Bot WhatsApp Avançado | RPG • Economia • IA • Admin${colors.reset}`);
  console.log(`${colors.cyan}  📦 Versão 1.0.0${colors.reset}`);
  print.sep();
  console.log();
}

function setupGracefulShutdown() {
  const shutdown = () => {
    print.warn('\n🛑 Encerrando NOCTURNUS... Até logo!');
    if (botProcess) {
      botProcess.removeAllListeners();
      botProcess.kill();
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

function startBot(codeMode = false) {
  const args = ['--expose-gc', CONNECT_FILE];
  if (codeMode) args.push('--code');

  print.info(`📷 Iniciando com ${codeMode ? 'código de pareamento' : 'QR Code'}...`);

  botProcess = spawn('node', args, {
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  botProcess.on('error', (error) => {
    print.err(`❌ Erro ao iniciar bot: ${error.message}`);
    restartBot(codeMode);
  });

  botProcess.on('close', (code) => {
    print.warn(`⚠️ Bot encerrado (código: ${code}). Reiniciando em 2s...`);
    restartBot(codeMode);
  });

  return botProcess;
}

function restartBot(codeMode) {
  setTimeout(() => {
    if (botProcess) botProcess.removeAllListeners();
    startBot(codeMode);
  }, 2000);
}

async function checkAutoConnect() {
  try {
    if (!fsSync.existsSync(QR_CODE_DIR)) {
      await fs.mkdir(QR_CODE_DIR, { recursive: true });
      return false;
    }
    const files = await fs.readdir(QR_CODE_DIR);
    return files.length > 2;
  } catch {
    return false;
  }
}

async function checkConfig() {
  if (!fsSync.existsSync(CONFIG_PATH)) {
    print.warn('⚠️ Arquivo config.json não encontrado! Execute: npm run config');
    process.exit(1);
  }
}

async function promptConnectionMethod() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  print.info('🔧 Escolha o método de conexão:');
  print.info('  1. 📷 QR Code');
  print.info('  2. 🔑 Código de pareamento');
  print.info('  3. 🚪 Sair');

  const answer = await rl.question('\n➡️ Opção: ');
  rl.close();

  switch (answer.trim()) {
    case '1': return { method: 'qr' };
    case '2': return { method: 'code' };
    case '3': print.msg('👋 Até logo!'); process.exit(0);
    default:
      print.warn('⚠️ Opção inválida. Usando QR Code.');
      return { method: 'qr' };
  }
}

async function main() {
  setupGracefulShutdown();
  displayBanner();
  await checkConfig();

  const hasSession = await checkAutoConnect();
  if (hasSession) {
    print.msg('✅ Sessão detectada. Conectando automaticamente...');
    startBot(false);
  } else {
    const { method } = await promptConnectionMethod();
    startBot(method === 'code');
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err.message);
  process.exit(1);
});
