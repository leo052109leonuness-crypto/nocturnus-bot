#!/usr/bin/env node

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import readline from 'readline';

const CONFIG_FILE = path.join(process.cwd(), 'src', 'config.json');

const colors = {
  reset: '\x1b[0m', green: '\x1b[1;32m', red: '\x1b[1;31m',
  blue: '\x1b[1;34m', yellow: '\x1b[1;33m', cyan: '\x1b[1;36m',
  bold: '\x1b[1m', purple: '\x1b[1;35m',
};

const print = {
  msg: (t) => console.log(`${colors.green}${t}${colors.reset}`),
  err: (t) => console.log(`${colors.red}${t}${colors.reset}`),
  info: (t) => console.log(`${colors.cyan}${t}${colors.reset}`),
  sep: () => console.log(`${colors.blue}════════════════════════════════════════${colors.reset}`),
};

async function ask(rl, question, defaultVal = '') {
  return new Promise((resolve) => {
    const display = defaultVal ? `${question} ${colors.yellow}[${defaultVal}]${colors.reset}: ` : `${question}: `;
    rl.question(display, (answer) => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

async function main() {
  print.sep();
  console.log(`${colors.purple}${colors.bold}  🌙 NOCTURNUS - Configurador Inicial${colors.reset}`);
  print.sep();
  console.log();

  let config = {
    nomebot: 'NOCTURNUS',
    nomedono: '',
    numerodono: '',
    prefixo: '!',
    openaiKey: ''
  };

  try {
    const existing = JSON.parse(fsSync.readFileSync(CONFIG_FILE, 'utf8'));
    config = { ...config, ...existing };
    print.info('📂 Configuração existente encontrada e carregada.\n');
  } catch { }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  print.info('Preencha as configurações abaixo (pressione ENTER para manter o valor atual):\n');

  config.nomebot = await ask(rl, '🤖 Nome do bot', config.nomebot);
  config.nomedono = await ask(rl, '👤 Seu nome (dono do bot)', config.nomedono);
  config.numerodono = await ask(rl, '📱 Seu número WhatsApp (ex: 5511999999999)', config.numerodono);
  config.prefixo = await ask(rl, '🔣 Prefixo dos comandos (ex: ! ou /)', config.prefixo);
  config.openaiKey = await ask(rl, '🤖 Chave OpenAI (opcional, para comandos de IA)', config.openaiKey);

  rl.close();

  await fs.mkdir(path.dirname(CONFIG_FILE), { recursive: true });
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));

  print.sep();
  print.msg('✅ Configuração salva com sucesso!');
  print.info(`\n📋 Resumo:`);
  print.info(`   🤖 Bot: ${config.nomebot}`);
  print.info(`   👤 Dono: ${config.nomedono}`);
  print.info(`   📱 Número: ${config.numerodono}`);
  print.info(`   🔣 Prefixo: ${config.prefixo}`);
  print.sep();
  print.msg('\n🚀 Agora execute: npm start');
}

main().catch((err) => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
