/**
 * 🌙 NOCTURNUS - Handler Principal de Comandos
 * Baseado na arquitetura do Nazuna com todos os comandos implementados
 */

import { getContentType, downloadContentFromMessage } from 'whaileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB, getUser, createUser, addXP, addCoins, removeCoins, getCooldown, setCooldown, getGroupSettings, setGroupSettings, getWarnings, addWarning, resetWarnings, getRanking } from './utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await initDB();

// ─── FUNÇÕES AUXILIARES ────────────────────────────────────────────────────

function getBody(msg) {
    return msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
        '';
}

function getSender(msg) {
    return msg.key?.participant || msg.key?.remoteJid || '';
}

function getJid(msg) {
    return msg.key?.remoteJid || '';
}

function isGroup(jid) {
    return jid?.endsWith('@g.us');
}

function isFromMe(msg) {
    return msg.key?.fromMe === true;
}

async function react(sock, msg, emoji) {
    try {
        await sock.sendMessage(msg.key.remoteJid, {
            react: { text: emoji, key: msg.key }
        });
    } catch { }
}

async function reply(sock, jid, text, quoted = null) {
    try {
        const opts = { text };
        if (quoted) opts.quoted = quoted;
        return await sock.sendMessage(jid, opts);
    } catch (e) {
        console.error('Erro reply:', e.message);
    }
}

async function isAdmin(sock, jid, sender) {
    try {
        const meta = await sock.groupMetadata(jid);
        return meta.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
    } catch { return false; }
}

async function isBotAdmin(sock, jid) {
    try {
        const meta = await sock.groupMetadata(jid);
        const botJid = sock.user.id.replace(':0', '').replace(/:\d+/, '');
        return meta.participants.some(p => (p.id === botJid || p.id.startsWith(botJid.split('@')[0])) && (p.admin === 'admin' || p.admin === 'superadmin'));
    } catch { return false; }
}

function formatNumber(n) {
    return Number(n).toLocaleString('pt-BR');
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getLevel(xp) {
    return Math.floor(0.1 * Math.sqrt(xp)) + 1;
}

function xpForNextLevel(level) {
    return Math.pow((level) / 0.1, 2);
}

function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
}

function getMention(jid) {
    return jid.split('@')[0];
}

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────

export default async function handler(sock, msg, config) {
    const { prefixo = '!', nomebot = 'NOCTURNUS', nomedono = '', numerodono = '', openaiKey = '' } = config;

    const jid = getJid(msg);
    const sender = getSender(msg);
    const body = getBody(msg);
    const fromGroup = isGroup(jid);
    const fromMe = isFromMe(msg);

    if (!body) return;
    if (!body.startsWith(prefixo)) return;

    const args = body.slice(prefixo.length).trim().split(/\s+/);
    const cmd = args.shift().toLowerCase();
    const text = args.join(' ');
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ? {
        key: {
            remoteJid: jid,
            id: msg.message?.extendedTextMessage?.contextInfo?.stanzaId,
            participant: msg.message?.extendedTextMessage?.contextInfo?.participant
        },
        message: msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    } : null;

    const isDono = sender.startsWith(numerodono);
    const senderName = msg.pushName || 'Usuário';

    // Garantir usuário no banco
    await createUser(sender, senderName);

    // ─── MENU PRINCIPAL ───────────────────────────────────────────────────
    if (['menu', 'ajuda', 'help', 'start'].includes(cmd)) {
        const menuText = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *MENU PRINCIPAL*
┊
┊•.̇𖥨֗🍓⭟ ${prefixo}menuadm
┊•.̇𖥨֗🍓⭟ ${prefixo}menurpg
┊•.̇𖥨֗🍓⭟ ${prefixo}menudown
┊•.̇𖥨֗🍓⭟ ${prefixo}menuia
┊•.̇𖥨֗🍓⭟ ${prefixo}menufig
┊•.̇𖥨֗🍓⭟ ${prefixo}menubn
┊•.̇𖥨֗🍓⭟ ${prefixo}ferramentas
┊•.̇𖥨֗🍓⭟ ${prefixo}menumemb
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *UTILIDADES*
┊•.̇𖥨֗🍓⭟ ${prefixo}ping
┊•.̇𖥨֗🍓⭟ ${prefixo}uptime
┊•.̇𖥨֗🍓⭟ ${prefixo}dono
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

> 🌙 *${nomebot}* — Bot WhatsApp Avançado`;
        await reply(sock, jid, menuText, msg);
        return;
    }

    // ─── MENU ADM ─────────────────────────────────────────────────────────
    if (['menuadm', 'menuadmin'].includes(cmd)) {
        const t = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *🔐 ADMINISTRAÇÃO*
┊
┊•.̇𖥨֗🍓⭟ ${prefixo}ban @user
┊•.̇𖥨֗🍓⭟ ${prefixo}kick @user
┊•.̇𖥨֗🍓⭟ ${prefixo}add <número>
┊•.̇𖥨֗🍓⭟ ${prefixo}promover @user
┊•.̇𖥨֗🍓⭟ ${prefixo}rebaixar @user
┊•.̇𖥨֗🍓⭟ ${prefixo}adv @user <motivo>
┊•.̇𖥨֗🍓⭟ ${prefixo}rmadv @user
┊•.̇𖥨֗🍓⭟ ${prefixo}advsver @user
┊•.̇𖥨֗🍓⭟ ${prefixo}mute
┊•.̇𖥨֗🍓⭟ ${prefixo}unmute
┊•.̇𖥨֗🍓⭟ ${prefixo}fechar
┊•.̇𖥨֗🍓⭟ ${prefixo}abrir
┊•.̇𖥨֗🍓⭟ ${prefixo}antilink on/off
┊•.̇𖥨֗🍓⭟ ${prefixo}boasvindas on/off
┊•.̇𖥨֗🍓⭟ ${prefixo}setprefix <novo>
┊•.̇𖥨֗🍓⭟ ${prefixo}nomegrupo <nome>
┊•.̇𖥨֗🍓⭟ ${prefixo}descgrupo <desc>
┊•.̇𖥨֗🍓⭟ ${prefixo}linkinvite
┊•.̇𖥨֗🍓⭟ ${prefixo}revogarlink
┊•.̇𖥨֗🍓⭟ ${prefixo}tagall <msg>
┊•.̇𖥨֗🍓⭟ ${prefixo}listar
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── MENU RPG ─────────────────────────────────────────────────────────
    if (['menurpg'].includes(cmd)) {
        const t = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *🎮 RPG & ECONOMIA*
┊
┊🧑 *PERFIL*
┊•.̇𖥨֗🍓⭟ ${prefixo}perfil
┊•.̇𖥨֗🍓⭟ ${prefixo}rank
┊•.̇𖥨֗🍓⭟ ${prefixo}top
┊
┊💰 *ECONOMIA*
┊•.̇𖥨֗🍓⭟ ${prefixo}saldo
┊•.̇𖥨֗🍓⭟ ${prefixo}trabalhar
┊•.̇𖥨֗🍓⭟ ${prefixo}minerar
┊•.̇𖥨֗🍓⭟ ${prefixo}pescar
┊•.̇𖥨֗🍓⭟ ${prefixo}roubar @user
┊•.̇𖥨֗🍓⭟ ${prefixo}dar @user <valor>
┊•.̇𖥨֗🍓⭟ ${prefixo}depositar <valor>
┊•.̇𖥨֗🍓⭟ ${prefixo}sacar <valor>
┊
┊🏪 *LOJA*
┊•.̇𖥨֗🍓⭟ ${prefixo}loja
┊•.̇𖥨֗🍓⭟ ${prefixo}comprar <item>
┊•.̇𖥨֗🍓⭟ ${prefixo}inventario
┊•.̇𖥨֗🍓⭟ ${prefixo}usar <item>
┊
┊⚔️ *COMBATE*
┊•.̇𖥨֗🍓⭟ ${prefixo}duelo @user
┊•.̇𖥨֗🍓⭟ ${prefixo}crime
┊•.̇𖥨֗🍓⭟ ${prefixo}assaltar @user
┊
┊🏰 *CLÃ*
┊•.̇𖥨֗🍓⭟ ${prefixo}criarcla <nome>
┊•.̇𖥨֗🍓⭟ ${prefixo}cla
┊•.̇𖥨֗🍓⭟ ${prefixo}entrarncla <nome>
┊•.̇𖥨֗🍓⭟ ${prefixo}saircla
┊
┊🎯 *MISSÕES*
┊•.̇𖥨֗🍓⭟ ${prefixo}missoes
┊•.̇𖥨֗🍓⭟ ${prefixo}conquistas
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── MENU DOWNLOAD ────────────────────────────────────────────────────
    if (['menudown', 'menudownload'].includes(cmd)) {
        const t = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *📥 DOWNLOADS*
┊
┊•.̇𖥨֗🍓⭟ ${prefixo}play <nome/link>
┊•.̇𖥨֗🍓⭟ ${prefixo}playvideo <nome/link>
┊•.̇𖥨֗🍓⭟ ${prefixo}tiktok <link>
┊•.̇𖥨֗🍓⭟ ${prefixo}instagram <link>
┊•.̇𖥨֗🍓⭟ ${prefixo}twitter <link>
┊•.̇𖥨֗🍓⭟ ${prefixo}pinterest <link>
┊•.̇𖥨֗🍓⭟ ${prefixo}encurtalink <url>
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── MENU IA ──────────────────────────────────────────────────────────
    if (['menuia', 'menuai'].includes(cmd)) {
        const t = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *🤖 INTELIGÊNCIA ARTIFICIAL*
┊
┊•.̇𖥨֗🍓⭟ ${prefixo}gpt <pergunta>
┊•.̇𖥨֗🍓⭟ ${prefixo}ia <pergunta>
┊•.̇𖥨֗🍓⭟ ${prefixo}explicar <tema>
┊•.̇𖥨֗🍓⭟ ${prefixo}resumir <texto>
┊•.̇𖥨֗🍓⭟ ${prefixo}traduzir <idioma> <texto>
┊•.̇𖥨֗🍓⭟ ${prefixo}corrigir <texto>
┊•.̇𖥨֗🍓⭟ ${prefixo}historia <tema>
┊•.̇𖥨֗🍓⭟ ${prefixo}receita <prato>
┊•.̇𖥨֗🍓⭟ ${prefixo}piada
┊•.̇𖥨֗🍓⭟ ${prefixo}curiosidade
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── MENU FIGURINHAS ──────────────────────────────────────────────────
    if (['menufig', 'menusticker'].includes(cmd)) {
        const t = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *🎨 FIGURINHAS*
┊
┊•.̇𖥨֗🍓⭟ ${prefixo}sticker (responda imagem)
┊•.̇𖥨֗🍓⭟ ${prefixo}s (responda imagem)
┊•.̇𖥨֗🍓⭟ ${prefixo}toimg (responda figurinha)
┊•.̇𖥨֗🍓⭟ ${prefixo}ttp <texto>
┊•.̇𖥨֗🍓⭟ ${prefixo}attp <texto>
┊•.̇𖥨֗🍓⭟ ${prefixo}emojimix <emoji1> <emoji2>
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── MENU BRINCADEIRAS ────────────────────────────────────────────────
    if (['menubn', 'menubrincadeiras', 'menugames', 'menujogos'].includes(cmd)) {
        const t = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *🎭 JOGOS & DIVERSÃO*
┊
┊🎲 *JOGOS*
┊•.̇𖥨֗🍓⭟ ${prefixo}dado
┊•.̇𖥨֗🍓⭟ ${prefixo}moeda
┊•.̇𖥨֗🍓⭟ ${prefixo}8ball <pergunta>
┊•.̇𖥨֗🍓⭟ ${prefixo}quiz
┊•.̇𖥨֗🍓⭟ ${prefixo}forca
┊•.̇𖥨֗🍓⭟ ${prefixo}verdadeoudesafio
┊•.̇𖥨֗🍓⭟ ${prefixo}roleta
┊•.̇𖥨֗🍓⭟ ${prefixo}adivinhar
┊
┊😂 *DIVERSÃO*
┊•.̇𖥨֗🍓⭟ ${prefixo}piada
┊•.̇𖥨֗🍓⭟ ${prefixo}meme
┊•.̇𖥨֗🍓⭟ ${prefixo}curiosidade
┊•.̇𖥨֗🍓⭟ ${prefixo}fato
┊•.̇𖥨֗🍓⭟ ${prefixo}cifra
┊•.̇𖥨֗🍓⭟ ${prefixo}ship @user @user
┊•.̇𖥨֗🍓⭟ ${prefixo}gay @user
┊•.̇𖥨֗🍓⭟ ${prefixo}sortudo
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── MENU MEMBROS ─────────────────────────────────────────────────────
    if (['menumemb', 'menumembros'].includes(cmd)) {
        const t = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *👥 MEMBROS*
┊
┊•.̇𖥨֗🍓⭟ ${prefixo}perfil
┊•.̇𖥨֗🍓⭟ ${prefixo}rank
┊•.̇𖥨֗🍓⭟ ${prefixo}top
┊•.̇𖥨֗🍓⭟ ${prefixo}saldo
┊•.̇𖥨֗🍓⭟ ${prefixo}inventario
┊•.̇𖥨֗🍓⭟ ${prefixo}conquistas
┊•.̇𖥨֗🍓⭟ ${prefixo}missoes
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── FERRAMENTAS ──────────────────────────────────────────────────────
    if (['ferramentas', 'tools'].includes(cmd)) {
        const t = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *🔧 FERRAMENTAS*
┊
┊•.̇𖥨֗🍓⭟ ${prefixo}calc <expressão>
┊•.̇𖥨֗🍓⭟ ${prefixo}qrcode <texto>
┊•.̇𖥨֗🍓⭟ ${prefixo}encurtalink <url>
┊•.̇𖥨֗🍓⭟ ${prefixo}clima <cidade>
┊•.̇𖥨֗🍓⭟ ${prefixo}horoscopo <signo>
┊•.̇𖥨֗🍓⭟ ${prefixo}dicionario <palavra>
┊•.̇𖥨֗🍓⭟ ${prefixo}traduzir <idioma> <texto>
┊•.̇𖥨֗🍓⭟ ${prefixo}gerarnick
┊•.̇𖥨֗🍓⭟ ${prefixo}cep <cep>
┊•.̇𖥨֗🍓⭟ ${prefixo}ping
┊•.̇𖥨֗🍓⭟ ${prefixo}uptime
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── PING ─────────────────────────────────────────────────────────────
    if (['ping', 'speed', 'velocidade'].includes(cmd)) {
        const start = Date.now();
        const m = await reply(sock, jid, '🏓 Calculando...', msg);
        const end = Date.now();
        await reply(sock, jid, `🏓 *Pong!*\n⚡ Latência: *${end - start}ms*\n🤖 Bot: *${nomebot}*`, msg);
        return;
    }

    // ─── UPTIME ───────────────────────────────────────────────────────────
    if (['uptime', 'tempo'].includes(cmd)) {
        const up = process.uptime();
        const h = Math.floor(up / 3600);
        const m = Math.floor((up % 3600) / 60);
        const s = Math.floor(up % 60);
        await reply(sock, jid, `⏱️ *Uptime:* ${h}h ${m}m ${s}s\n🤖 Bot: *${nomebot}*`, msg);
        return;
    }

    // ─── DONO ─────────────────────────────────────────────────────────────
    if (['dono', 'owner', 'criador'].includes(cmd)) {
        await reply(sock, jid, `👑 *Dono do Bot*\n\n🤖 Bot: *${nomebot}*\n👤 Dono: *${nomedono || 'Não configurado'}*\n📱 Contato: wa.me/${numerodono}`, msg);
        return;
    }

    // ─── CALC ─────────────────────────────────────────────────────────────
    if (['calc', 'calcular', 'matematica'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}calc <expressão>\nEx: ${prefixo}calc 2+2*3`, msg);
        try {
            const expr = text.replace(/[^0-9+\-*/.()%\s]/g, '');
            if (!expr) return reply(sock, jid, '❌ Expressão inválida!', msg);
            const result = Function(`"use strict"; return (${expr})`)();
            await reply(sock, jid, `🧮 *Calculadora*\n\n📝 Expressão: \`${text}\`\n✅ Resultado: *${result}*`, msg);
        } catch {
            await reply(sock, jid, '❌ Expressão matemática inválida!', msg);
        }
        return;
    }

    // ─── ENCURTAR LINK ────────────────────────────────────────────────────
    if (['encurtalink', 'encurtar', 'shortlink'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}encurtalink <url>`, msg);
        try {
            const { default: fetch } = await import('node-fetch').catch(() => ({ default: globalThis.fetch }));
            const url = text.startsWith('http') ? text : `https://${text}`;
            const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            const short = await res.text();
            await reply(sock, jid, `🔗 *Link Encurtado*\n\n📎 Original: ${url}\n✅ Curto: ${short}`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao encurtar o link. Verifique a URL!', msg);
        }
        return;
    }

    // ─── CEP ──────────────────────────────────────────────────────────────
    if (['cep', 'buscarcep'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}cep <cep>`, msg);
        try {
            const cep = text.replace(/\D/g, '');
            const { default: fetch } = await import('node-fetch').catch(() => ({ default: globalThis.fetch }));
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (data.erro) return reply(sock, jid, '❌ CEP não encontrado!', msg);
            await reply(sock, jid, `📍 *CEP: ${data.cep}*\n\n🏠 Logradouro: ${data.logradouro}\n🏘️ Bairro: ${data.bairro}\n🏙️ Cidade: ${data.localidade}\n🗺️ Estado: ${data.uf}\n📡 IBGE: ${data.ibge}`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao buscar CEP!', msg);
        }
        return;
    }

    // ─── CLIMA ────────────────────────────────────────────────────────────
    if (['clima', 'tempo', 'weather'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}clima <cidade>`, msg);
        try {
            const { default: fetch } = await import('node-fetch').catch(() => ({ default: globalThis.fetch }));
            const res = await fetch(`https://wttr.in/${encodeURIComponent(text)}?format=j1`);
            const data = await res.json();
            const cur = data.current_condition[0];
            const area = data.nearest_area[0];
            const cidade = area.areaName[0].value;
            const pais = area.country[0].value;
            const temp = cur.temp_C;
            const sensacao = cur.FeelsLikeC;
            const umidade = cur.humidity;
            const desc = cur.lang_pt?.[0]?.value || cur.weatherDesc[0].value;
            await reply(sock, jid, `🌤️ *Clima em ${cidade}, ${pais}*\n\n🌡️ Temperatura: *${temp}°C*\n🤔 Sensação: *${sensacao}°C*\n💧 Umidade: *${umidade}%*\n📝 Condição: *${desc}*`, msg);
        } catch {
            await reply(sock, jid, '❌ Cidade não encontrada!', msg);
        }
        return;
    }

    // ─── HORÓSCOPO ────────────────────────────────────────────────────────
    if (['horoscopo', 'signo', 'horoscope'].includes(cmd)) {
        const signos = {
            aries: '♈ Áries', touro: '♉ Touro', gemeos: '♊ Gêmeos', cancer: '♋ Câncer',
            leao: '♌ Leão', virgem: '♍ Virgem', libra: '♎ Libra', escorpiao: '♏ Escorpião',
            sagitario: '♐ Sagitário', capricornio: '♑ Capricórnio', aquario: '♒ Aquário', peixes: '♓ Peixes'
        };
        const msgs = [
            'Hoje é um ótimo dia para novos começos! ✨',
            'Cuidado com decisões impulsivas. Pense antes de agir. 🤔',
            'O amor está no ar! Aproveite os momentos especiais. ❤️',
            'Sua criatividade está em alta. Use-a a seu favor! 🎨',
            'Foque no que realmente importa e ignore distrações. 🎯',
            'Surpresas positivas estão a caminho! 🎁',
            'Cuide da sua saúde e bem-estar hoje. 💪',
            'Boas notícias financeiras podem surgir. 💰',
            'Fortaleça seus laços com amigos e família. 👨‍👩‍👧',
            'Confie no seu instinto, ele está certo! 🔮'
        ];
        const signoKey = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '');
        const signoNome = signos[signoKey];
        if (!signoNome) {
            const lista = Object.keys(signos).join(', ');
            return reply(sock, jid, `❌ Signo inválido!\n\nSignos disponíveis: ${lista}`, msg);
        }
        const msg_horoscopo = msgs[Math.floor(Math.random() * msgs.length)];
        const sorte = random(1, 10);
        const numSorte = random(1, 99);
        await reply(sock, jid, `${signoNome} *Horóscopo de Hoje*\n\n📖 ${msg_horoscopo}\n\n⭐ Sorte: ${'⭐'.repeat(sorte)}${'☆'.repeat(10 - sorte)} (${sorte}/10)\n🍀 Número da sorte: *${numSorte}*`, msg);
        return;
    }

    // ─── GERAR NICK ───────────────────────────────────────────────────────
    if (['gerarnick', 'nick', 'nickname'].includes(cmd)) {
        const prefixos = ['Dark', 'Shadow', 'Night', 'Moon', 'Star', 'Fire', 'Ice', 'Storm', 'Void', 'Neon', 'Cyber', 'Ghost', 'Blade', 'Wolf', 'Dragon', 'Phoenix', 'Raven', 'Viper', 'Titan', 'Nova'];
        const sufixos = ['Hunter', 'Slayer', 'Master', 'King', 'Lord', 'Knight', 'Warrior', 'Ranger', 'Mage', 'Rogue', 'Assassin', 'Phantom', 'Specter', 'Reaper', 'Crusher', 'Bringer', 'Seeker', 'Walker', 'Breaker', 'Bane'];
        const nums = ['', '', '', random(1, 99), random(100, 999), '_' + random(1, 99)];
        const nick = `${prefixos[random(0, prefixos.length - 1)]}${sufixos[random(0, sufixos.length - 1)]}${nums[random(0, nums.length - 1)]}`;
        await reply(sock, jid, `🎮 *Nick Gerado:*\n\n✨ \`${nick}\`\n\nUse ${prefixo}gerarnick para gerar outro!`, msg);
        return;
    }

    // ─── PERFIL ───────────────────────────────────────────────────────────
    if (['perfil', 'profile', 'status', 'eu'].includes(cmd)) {
        const target = mentioned[0] || sender;
        await createUser(target, senderName);
        const user = await getUser(target);
        if (!user) return reply(sock, jid, '❌ Usuário não encontrado!', msg);
        const level = getLevel(user.xp);
        const nextXP = xpForNextLevel(level);
        const progress = Math.floor((user.xp / nextXP) * 10);
        const bar = '█'.repeat(progress) + '░'.repeat(10 - progress);
        await reply(sock, jid, `🌙 *Perfil — ${user.name}*\n\n⚔️ Nível: *${level}*\n✨ XP: *${formatNumber(user.xp)}* / ${formatNumber(Math.floor(nextXP))}\n📊 Progresso: [${bar}]\n💰 Moedas: *${formatNumber(user.coins)}* 🪙\n\n📱 ID: @${getMention(target)}`, msg);
        return;
    }

    // ─── SALDO ────────────────────────────────────────────────────────────
    if (['saldo', 'carteira', 'coins', 'dinheiro'].includes(cmd)) {
        const user = await getUser(sender);
        await reply(sock, jid, `💰 *Saldo de ${senderName}*\n\n🪙 Moedas: *${formatNumber(user?.coins || 0)}*\n✨ XP: *${formatNumber(user?.xp || 0)}*\n⚔️ Nível: *${getLevel(user?.xp || 0)}*`, msg);
        return;
    }

    // ─── RANKING ──────────────────────────────────────────────────────────
    if (['rank', 'ranking', 'top', 'topxp'].includes(cmd)) {
        const tipo = args[0] === 'coins' ? 'coins' : 'xp';
        const lista = await getRanking(tipo, 10);
        if (!lista.length) return reply(sock, jid, '❌ Nenhum usuário no ranking ainda!', msg);
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const rows = lista.map((u, i) => `${medals[i]} *${u.name}* — ${tipo === 'coins' ? `💰 ${formatNumber(u.coins)}` : `✨ ${formatNumber(u.xp)} XP (Nv.${getLevel(u.xp)})`}`).join('\n');
        await reply(sock, jid, `🏆 *Top 10 — ${tipo === 'coins' ? 'Mais Ricos' : 'Mais XP'}*\n\n${rows}\n\nUse ${prefixo}rank coins para ranking de moedas`, msg);
        return;
    }

    // ─── TRABALHAR ────────────────────────────────────────────────────────
    if (['trabalhar', 'trabalho', 'work', 'job'].includes(cmd)) {
        const cdKey = `trabalhar:${sender}`;
        const cd = await getCooldown(cdKey);
        if (cd) return reply(sock, jid, `⏳ Aguarde *${formatTime(cd - Date.now())}* para trabalhar novamente!`, msg);

        const jobs = [
            { nome: 'programador', emoji: '💻', min: 80, max: 200 },
            { nome: 'médico', emoji: '🏥', min: 150, max: 350 },
            { nome: 'chef de cozinha', emoji: '👨‍🍳', min: 60, max: 150 },
            { nome: 'motorista', emoji: '🚗', min: 50, max: 120 },
            { nome: 'professor', emoji: '📚', min: 70, max: 160 },
            { nome: 'engenheiro', emoji: '⚙️', min: 100, max: 250 },
            { nome: 'músico', emoji: '🎵', min: 40, max: 300 },
            { nome: 'artista', emoji: '🎨', min: 30, max: 200 },
            { nome: 'vendedor', emoji: '🛒', min: 50, max: 180 },
            { nome: 'advogado', emoji: '⚖️', min: 120, max: 400 },
        ];
        const job = jobs[random(0, jobs.length - 1)];
        const ganho = random(job.min, job.max);
        const xpGanho = random(10, 30);
        await addCoins(sender, ganho);
        await addXP(sender, xpGanho);
        await setCooldown(cdKey, 60 * 1000);
        await react(sock, msg, '💼');
        await reply(sock, jid, `${job.emoji} *Trabalho Concluído!*\n\nVocê trabalhou como *${job.nome}* e ganhou:\n💰 +${formatNumber(ganho)} moedas\n✨ +${xpGanho} XP\n\n⏳ Próximo trabalho em 1 minuto`, msg);
        return;
    }

    // ─── MINERAR ──────────────────────────────────────────────────────────
    if (['minerar', 'mine', 'mineracao'].includes(cmd)) {
        const cdKey = `minerar:${sender}`;
        const cd = await getCooldown(cdKey);
        if (cd) return reply(sock, jid, `⏳ Aguarde *${formatTime(cd - Date.now())}* para minerar novamente!`, msg);

        const minerais = [
            { nome: 'carvão', emoji: '⬛', min: 20, max: 60 },
            { nome: 'ferro', emoji: '⚙️', min: 40, max: 100 },
            { nome: 'ouro', emoji: '🟡', min: 80, max: 200 },
            { nome: 'diamante', emoji: '💎', min: 150, max: 400 },
            { nome: 'rubi', emoji: '🔴', min: 200, max: 500 },
            { nome: 'esmeralda', emoji: '💚', min: 180, max: 450 },
        ];
        const mineral = minerais[random(0, minerais.length - 1)];
        const ganho = random(mineral.min, mineral.max);
        const xpGanho = random(15, 40);
        await addCoins(sender, ganho);
        await addXP(sender, xpGanho);
        await setCooldown(cdKey, 2 * 60 * 1000);
        await react(sock, msg, '⛏️');
        await reply(sock, jid, `⛏️ *Mineração Concluída!*\n\nVocê encontrou *${mineral.emoji} ${mineral.nome}* e ganhou:\n💰 +${formatNumber(ganho)} moedas\n✨ +${xpGanho} XP\n\n⏳ Próxima mineração em 2 minutos`, msg);
        return;
    }

    // ─── PESCAR ───────────────────────────────────────────────────────────
    if (['pescar', 'pesca', 'fish', 'fishing'].includes(cmd)) {
        const cdKey = `pescar:${sender}`;
        const cd = await getCooldown(cdKey);
        if (cd) return reply(sock, jid, `⏳ Aguarde *${formatTime(cd - Date.now())}* para pescar novamente!`, msg);

        const peixes = [
            { nome: 'sardinha', emoji: '🐟', min: 10, max: 40 },
            { nome: 'tilápia', emoji: '🐠', min: 20, max: 60 },
            { nome: 'salmão', emoji: '🐡', min: 50, max: 120 },
            { nome: 'atum', emoji: '🦈', min: 80, max: 200 },
            { nome: 'carpa dourada', emoji: '🥇', min: 150, max: 350 },
            { nome: 'bota velha', emoji: '👢', min: 1, max: 5 },
        ];
        const peixe = peixes[random(0, peixes.length - 1)];
        const ganho = random(peixe.min, peixe.max);
        const xpGanho = random(8, 25);
        await addCoins(sender, ganho);
        await addXP(sender, xpGanho);
        await setCooldown(cdKey, 90 * 1000);
        await react(sock, msg, '🎣');
        await reply(sock, jid, `🎣 *Pescaria Concluída!*\n\nVocê pescou *${peixe.emoji} ${peixe.nome}* e ganhou:\n💰 +${formatNumber(ganho)} moedas\n✨ +${xpGanho} XP\n\n⏳ Próxima pescaria em 1m30s`, msg);
        return;
    }

    // ─── CRIME ────────────────────────────────────────────────────────────
    if (['crime', 'roubar', 'assalto'].includes(cmd)) {
        const cdKey = `crime:${sender}`;
        const cd = await getCooldown(cdKey);
        if (cd) return reply(sock, jid, `⏳ Aguarde *${formatTime(cd - Date.now())}* para cometer outro crime!`, msg);

        const sucesso = random(1, 100) <= 60;
        await setCooldown(cdKey, 5 * 60 * 1000);

        if (sucesso) {
            const ganho = random(50, 300);
            await addCoins(sender, ganho);
            await addXP(sender, random(20, 50));
            const crimes = ['assaltou um banco', 'roubou uma joalheria', 'hackeou um sistema', 'furtou uma carteira', 'roubou um carro'];
            await react(sock, msg, '🦹');
            await reply(sock, jid, `🦹 *Crime Bem-Sucedido!*\n\nVocê ${crimes[random(0, crimes.length - 1)]} e conseguiu:\n💰 +${formatNumber(ganho)} moedas\n\n⏳ Próximo crime em 5 minutos`, msg);
        } else {
            const multa = random(20, 100);
            await removeCoins(sender, multa);
            await reply(sock, jid, `👮 *Você Foi Preso!*\n\nA polícia te pegou e você pagou:\n💸 -${formatNumber(multa)} moedas de multa\n\n⏳ Tente novamente em 5 minutos`, msg);
        }
        return;
    }

    // ─── DAR MOEDAS ───────────────────────────────────────────────────────
    if (['dar', 'transferir', 'pagar', 'send'].includes(cmd)) {
        const target = mentioned[0];
        if (!target) return reply(sock, jid, `❌ Use: ${prefixo}dar @usuario <valor>`, msg);
        const valor = parseInt(args[1] || args[0]);
        if (!valor || valor <= 0) return reply(sock, jid, '❌ Valor inválido!', msg);
        const user = await getUser(sender);
        if (!user || user.coins < valor) return reply(sock, jid, '❌ Saldo insuficiente!', msg);
        await removeCoins(sender, valor);
        await createUser(target, 'Usuário');
        await addCoins(target, valor);
        await react(sock, msg, '💸');
        await reply(sock, jid, `💸 *Transferência Realizada!*\n\n📤 De: @${getMention(sender)}\n📥 Para: @${getMention(target)}\n💰 Valor: *${formatNumber(valor)} moedas*`, msg);
        return;
    }

    // ─── LOJA ─────────────────────────────────────────────────────────────
    if (['loja', 'shop', 'store'].includes(cmd)) {
        const t = `🏪 *Loja do ${nomebot}*\n\n╭─── ITENS ───╮\n│ 🗡️ Espada Básica — 500 moedas\n│ 🛡️ Escudo Básico — 400 moedas\n│ 🏹 Arco e Flecha — 350 moedas\n│ 🧪 Poção de Vida — 100 moedas\n│ 💎 Amuleto — 1.000 moedas\n│ 🔮 Orbe Mágico — 800 moedas\n│ 🎒 Mochila Extra — 600 moedas\n╰─────────────╯\n\nUse: ${prefixo}comprar <item>`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── COMPRAR ──────────────────────────────────────────────────────────
    if (['comprar', 'buy', 'purchase'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}comprar <item>\nVeja a ${prefixo}loja`, msg);
        const itens = {
            'espada basica': { preco: 500, emoji: '🗡️' },
            'escudo basico': { preco: 400, emoji: '🛡️' },
            'arco e flecha': { preco: 350, emoji: '🏹' },
            'pocao de vida': { preco: 100, emoji: '🧪' },
            'amuleto': { preco: 1000, emoji: '💎' },
            'orbe magico': { preco: 800, emoji: '🔮' },
            'mochila extra': { preco: 600, emoji: '🎒' },
        };
        const itemKey = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const item = itens[itemKey];
        if (!item) return reply(sock, jid, `❌ Item não encontrado! Use ${prefixo}loja para ver os itens.`, msg);
        const user = await getUser(sender);
        if (!user || user.coins < item.preco) return reply(sock, jid, `❌ Saldo insuficiente! Você tem *${formatNumber(user?.coins || 0)}* moedas e precisa de *${formatNumber(item.preco)}*.`, msg);
        await removeCoins(sender, item.preco);
        await react(sock, msg, '🛒');
        await reply(sock, jid, `${item.emoji} *Compra Realizada!*\n\nItem: *${text}*\n💸 Pago: *${formatNumber(item.preco)} moedas*\n💰 Saldo restante: *${formatNumber(user.coins - item.preco)} moedas*`, msg);
        return;
    }

    // ─── INVENTÁRIO ───────────────────────────────────────────────────────
    if (['inventario', 'inv', 'inventory', 'bag'].includes(cmd)) {
        await reply(sock, jid, `🎒 *Inventário de ${senderName}*\n\n_Sistema de inventário em desenvolvimento..._\n\nUse ${prefixo}loja para comprar itens!`, msg);
        return;
    }

    // ─── MISSÕES ──────────────────────────────────────────────────────────
    if (['missoes', 'missao', 'quests', 'quest'].includes(cmd)) {
        const user = await getUser(sender);
        const level = getLevel(user?.xp || 0);
        await reply(sock, jid, `🎯 *Missões Disponíveis*\n\n📋 Missão 1: Trabalhe 5 vezes — Recompensa: 500 moedas\n📋 Missão 2: Minere 3 vezes — Recompensa: 300 moedas\n📋 Missão 3: Pesque 4 vezes — Recompensa: 400 moedas\n📋 Missão 4: Alcance nível ${level + 1} — Recompensa: 1.000 moedas\n\n_Sistema de missões completo em breve!_`, msg);
        return;
    }

    // ─── CONQUISTAS ───────────────────────────────────────────────────────
    if (['conquistas', 'achievements', 'badges'].includes(cmd)) {
        await reply(sock, jid, `🏆 *Conquistas de ${senderName}*\n\n🔒 Primeiro Trabalho — Complete seu primeiro trabalho\n🔒 Minerador — Mine 10 vezes\n🔒 Pescador — Pesque 10 vezes\n🔒 Rico — Acumule 10.000 moedas\n🔒 Veterano — Alcance nível 10\n\n_Sistema de conquistas em desenvolvimento!_`, msg);
        return;
    }

    // ─── DUELO ────────────────────────────────────────────────────────────
    if (['duelo', 'duel', 'batalha', 'lutar'].includes(cmd)) {
        const target = mentioned[0];
        if (!target) return reply(sock, jid, `❌ Use: ${prefixo}duelo @usuario`, msg);
        if (target === sender) return reply(sock, jid, '❌ Você não pode duelar consigo mesmo!', msg);

        const userA = await getUser(sender);
        const userB = await getUser(target);
        await createUser(target, 'Oponente');

        const levelA = getLevel(userA?.xp || 0);
        const levelB = getLevel(userB?.xp || 0);
        const chanceA = 50 + (levelA - levelB) * 5;
        const vencedor = random(1, 100) <= Math.max(10, Math.min(90, chanceA)) ? sender : target;
        const perdedor = vencedor === sender ? target : sender;
        const premio = random(50, 200);

        if ((await getUser(perdedor))?.coins >= premio) {
            await removeCoins(perdedor, premio);
            await addCoins(vencedor, premio);
        }
        await addXP(vencedor, 30);

        await react(sock, msg, '⚔️');
        await reply(sock, jid, `⚔️ *DUELO!*\n\n🥊 @${getMention(sender)} vs @${getMention(target)}\n\n*${vencedor === sender ? senderName : 'Oponente'}* venceu o duelo!\n💰 Prêmio: ${formatNumber(premio)} moedas`, msg);
        return;
    }

    // ─── DADO ─────────────────────────────────────────────────────────────
    if (['dado', 'dice', 'rolar', 'd6'].includes(cmd)) {
        const faces = parseInt(args[0]) || 6;
        const resultado = random(1, Math.min(faces, 1000));
        const emojis = { 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣', 6: '6️⃣' };
        await reply(sock, jid, `🎲 *Dado D${faces}*\n\n${emojis[resultado] || `*${resultado}*`}\n\nResultado: *${resultado}*`, msg);
        return;
    }

    // ─── MOEDA ────────────────────────────────────────────────────────────
    if (['moeda', 'coin', 'caraoucoroa', 'flipcoin'].includes(cmd)) {
        const resultado = random(0, 1) === 0 ? '🪙 CARA' : '🪙 COROA';
        await reply(sock, jid, `🪙 *Cara ou Coroa*\n\nResultado: *${resultado}*`, msg);
        return;
    }

    // ─── 8BALL ────────────────────────────────────────────────────────────
    if (['8ball', 'bola8', 'boladecrital', 'previsao'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}8ball <pergunta>`, msg);
        const respostas = [
            '✅ Com certeza!', '✅ Definitivamente sim!', '✅ Sem dúvida!',
            '✅ Sim, pode contar!', '✅ Tudo indica que sim!',
            '🤔 Não tenho certeza...', '🤔 Pergunta novamente mais tarde.',
            '🤔 Não posso prever agora.', '🤔 Concentre-se e pergunte novamente.',
            '❌ Não conte com isso.', '❌ A resposta é não.', '❌ Definitivamente não!',
            '❌ Minhas fontes dizem não.', '❌ Perspectiva não muito boa.',
        ];
        const resp = respostas[random(0, respostas.length - 1)];
        await reply(sock, jid, `🎱 *Bola 8 Mágica*\n\n❓ ${text}\n\n${resp}`, msg);
        return;
    }

    // ─── QUIZ ─────────────────────────────────────────────────────────────
    if (['quiz', 'pergunta', 'trivia'].includes(cmd)) {
        const perguntas = [
            { p: 'Qual é a capital do Brasil?', r: 'brasilia', a: 'Brasília', op: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'] },
            { p: 'Quantos estados tem o Brasil?', r: '27', a: '27', op: ['25', '26', '27', '28'] },
            { p: 'Qual é o maior planeta do sistema solar?', r: 'jupiter', a: 'Júpiter', op: ['Saturno', 'Júpiter', 'Netuno', 'Urano'] },
            { p: 'Quem pintou a Mona Lisa?', r: 'da vinci', a: 'Leonardo da Vinci', op: ['Michelangelo', 'Rafael', 'Leonardo da Vinci', 'Picasso'] },
            { p: 'Em que ano o Brasil foi descoberto?', r: '1500', a: '1500', op: ['1498', '1500', '1502', '1510'] },
            { p: 'Qual é o animal mais rápido do mundo?', r: 'guepardo', a: 'Guepardo', op: ['Leão', 'Guepardo', 'Falcão', 'Cavalo'] },
            { p: 'Qual é o elemento químico do ouro?', r: 'au', a: 'Au', op: ['Go', 'Au', 'Or', 'Gd'] },
            { p: 'Quantos lados tem um hexágono?', r: '6', a: '6', op: ['5', '6', '7', '8'] },
        ];
        const q = perguntas[random(0, perguntas.length - 1)];
        const ops = q.op.map((o, i) => `${['A', 'B', 'C', 'D'][i]}) ${o}`).join('\n');
        await reply(sock, jid, `🧠 *Quiz!*\n\n❓ ${q.p}\n\n${ops}\n\nResponda com a letra! (A, B, C ou D)\n\n_Resposta correta: ${q.a}_`, msg);
        return;
    }

    // ─── VERDADE OU DESAFIO ───────────────────────────────────────────────
    if (['verdadeoudesafio', 'vod', 'tod', 'verdade', 'desafio'].includes(cmd)) {
        const verdades = [
            'Qual é o seu maior medo?', 'Você já mentiu para alguém próximo?',
            'Qual é a coisa mais estranha que você já fez?', 'Você tem algum segredo que nunca contou?',
            'Qual foi o maior erro da sua vida?', 'Você já teve uma ressaca?',
            'Qual é a pessoa que você mais admira?', 'Você já traiu alguém?',
        ];
        const desafios = [
            'Mande uma mensagem para alguém que você não fala há muito tempo!',
            'Faça 10 flexões agora!', 'Cante uma música no grupo!',
            'Mude sua foto de perfil por 1 hora!', 'Escreva um poema para alguém do grupo!',
            'Faça uma imitação de alguém famoso!', 'Conte uma piada!',
            'Dance por 30 segundos!',
        ];
        const isVerdade = cmd === 'verdade' || (cmd === 'verdadeoudesafio' && random(0, 1) === 0);
        const lista = isVerdade ? verdades : desafios;
        const item = lista[random(0, lista.length - 1)];
        await reply(sock, jid, `${isVerdade ? '💬 *VERDADE*' : '🎯 *DESAFIO*'}\n\n${item}`, msg);
        return;
    }

    // ─── SHIP ─────────────────────────────────────────────────────────────
    if (['ship', 'casal', 'amor'].includes(cmd)) {
        const target = mentioned[0];
        if (!target) return reply(sock, jid, `❌ Use: ${prefixo}ship @usuario`, msg);
        const porcentagem = random(1, 100);
        const bar = '❤️'.repeat(Math.floor(porcentagem / 10)) + '🖤'.repeat(10 - Math.floor(porcentagem / 10));
        let status = porcentagem >= 80 ? '💑 Casal perfeito!' : porcentagem >= 60 ? '😍 Muito compatíveis!' : porcentagem >= 40 ? '🤔 Pode dar certo...' : porcentagem >= 20 ? '😬 Difícil...' : '💔 Não vai dar!';
        await reply(sock, jid, `💕 *Ship*\n\n@${getMention(sender)} + @${getMention(target)}\n\n${bar}\n💘 Compatibilidade: *${porcentagem}%*\n\n${status}`, msg);
        return;
    }

    // ─── GAY ──────────────────────────────────────────────────────────────
    if (['gay', 'gaymeter', 'homofobia'].includes(cmd)) {
        const target = mentioned[0] || sender;
        const porcentagem = random(1, 100);
        const bar = '🌈'.repeat(Math.floor(porcentagem / 10)) + '⬜'.repeat(10 - Math.floor(porcentagem / 10));
        await reply(sock, jid, `🌈 *Gay Meter*\n\n@${getMention(target)}\n\n${bar}\n📊 Resultado: *${porcentagem}%*`, msg);
        return;
    }

    // ─── SORTUDO ──────────────────────────────────────────────────────────
    if (['sortudo', 'sorte', 'lucky'].includes(cmd)) {
        const sorte = random(1, 100);
        const emoji = sorte >= 80 ? '🍀' : sorte >= 60 ? '⭐' : sorte >= 40 ? '🎯' : sorte >= 20 ? '😐' : '💀';
        await reply(sock, jid, `${emoji} *Sorte do Dia*\n\n@${getMention(sender)}\n\n📊 Sorte: *${sorte}%*`, msg);
        return;
    }

    // ─── PIADA ────────────────────────────────────────────────────────────
    if (['piada', 'joke', 'humor'].includes(cmd)) {
        const piadas = [
            '— Por que o livro de matemática foi ao médico?\nPorque tinha muitos problemas! 😂',
            '— O que o zero disse para o oito?\nBonito cinto! 😂',
            '— Por que o computador foi ao médico?\nPorque tinha vírus! 😂',
            '— O que é um peixe sem olho?\nPxe! 😂',
            '— Por que o espantalho ganhou um prêmio?\nPorque era excepcional no seu campo! 😂',
            '— O que o oceano disse para a praia?\nNada, só deu uma onda! 😂',
            '— Por que o professor foi à praia?\nPara ver as ondas de calor! 😂',
        ];
        await reply(sock, jid, `😂 *Piada do Dia*\n\n${piadas[random(0, piadas.length - 1)]}`, msg);
        return;
    }

    // ─── CURIOSIDADE ──────────────────────────────────────────────────────
    if (['curiosidade', 'fato', 'fact', 'sabia'].includes(cmd)) {
        const curiosidades = [
            '🐙 Os polvos têm três corações e sangue azul!',
            '🍯 O mel nunca estraga. Mel com 3.000 anos foi encontrado em tumbas egípcias!',
            '🌙 A Lua se afasta da Terra cerca de 3,8 cm por ano!',
            '🐘 Os elefantes são os únicos animais que não conseguem pular!',
            '🦋 As borboletas provam os alimentos com os pés!',
            '🌊 O oceano cobre 71% da superfície da Terra!',
            '🧠 O cérebro humano tem cerca de 86 bilhões de neurônios!',
            '⚡ Um raio é 5 vezes mais quente que a superfície do Sol!',
            '🐬 Os golfinhos dormem com um olho aberto!',
            '🌍 A Terra tem mais de 4,5 bilhões de anos!',
        ];
        await reply(sock, jid, `💡 *Curiosidade*\n\n${curiosidades[random(0, curiosidades.length - 1)]}`, msg);
        return;
    }

    // ─── FIGURINHA (STICKER) ──────────────────────────────────────────────
    if (['sticker', 's', 'figurinha', 'fig'].includes(cmd)) {
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
        if (!imageMsg) return reply(sock, jid, `❌ Responda uma imagem com ${prefixo}sticker para criar uma figurinha!`, msg);
        try {
            await react(sock, msg, '⏳');
            const stream = await downloadContentFromMessage(imageMsg, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            await sock.sendMessage(jid, { sticker: buffer }, { quoted: msg });
            await react(sock, msg, '✅');
        } catch (e) {
            await reply(sock, jid, '❌ Erro ao criar figurinha. Tente com outra imagem!', msg);
        }
        return;
    }

    // ─── IMAGEM PARA TEXTO (TOIMG) ────────────────────────────────────────
    if (['toimg', 'stickertoimg', 'sticker2img'].includes(cmd)) {
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const stickerMsg = msg.message?.stickerMessage || quotedMsg?.stickerMessage;
        if (!stickerMsg) return reply(sock, jid, `❌ Responda uma figurinha com ${prefixo}toimg para converter em imagem!`, msg);
        try {
            await react(sock, msg, '⏳');
            const stream = await downloadContentFromMessage(stickerMsg, 'sticker');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            await sock.sendMessage(jid, { image: buffer, caption: '✅ Figurinha convertida!' }, { quoted: msg });
        } catch {
            await reply(sock, jid, '❌ Erro ao converter figurinha!', msg);
        }
        return;
    }

    // ─── GPT / IA ─────────────────────────────────────────────────────────
    if (['gpt', 'ia', 'ai', 'chatgpt', 'perguntar'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}gpt <pergunta>`, msg);
        if (!openaiKey) return reply(sock, jid, '❌ API Key da OpenAI não configurada!\nConfigure em src/config.json', msg);
        try {
            await react(sock, msg, '🤖');
            const { default: OpenAI } = await import('openai');
            const client = new OpenAI({ apiKey: openaiKey });
            const res = await client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: `Você é ${nomebot}, um assistente de WhatsApp. Responda de forma clara e objetiva em português.` },
                    { role: 'user', content: text }
                ],
                max_tokens: 500,
            });
            const resposta = res.choices[0]?.message?.content || 'Sem resposta.';
            await reply(sock, jid, `🤖 *${nomebot} IA*\n\n${resposta}`, msg);
        } catch (e) {
            await reply(sock, jid, `❌ Erro na IA: ${e.message}`, msg);
        }
        return;
    }

    // ─── EXPLICAR ─────────────────────────────────────────────────────────
    if (['explicar', 'explain', 'oque', 'oqueé'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}explicar <tema>`, msg);
        if (!openaiKey) return reply(sock, jid, '❌ API Key da OpenAI não configurada!', msg);
        try {
            await react(sock, msg, '📚');
            const { default: OpenAI } = await import('openai');
            const client = new OpenAI({ apiKey: openaiKey });
            const res = await client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Explique de forma simples e didática em português.' },
                    { role: 'user', content: `Explique de forma simples: ${text}` }
                ],
                max_tokens: 400,
            });
            await reply(sock, jid, `📚 *Explicação: ${text}*\n\n${res.choices[0]?.message?.content}`, msg);
        } catch (e) {
            await reply(sock, jid, `❌ Erro: ${e.message}`, msg);
        }
        return;
    }

    // ─── RESUMIR ──────────────────────────────────────────────────────────
    if (['resumir', 'resumo', 'tldr', 'summarize'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}resumir <texto>`, msg);
        if (!openaiKey) return reply(sock, jid, '❌ API Key da OpenAI não configurada!', msg);
        try {
            await react(sock, msg, '📝');
            const { default: OpenAI } = await import('openai');
            const client = new OpenAI({ apiKey: openaiKey });
            const res = await client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Resuma o texto de forma concisa em português.' },
                    { role: 'user', content: `Resuma: ${text}` }
                ],
                max_tokens: 300,
            });
            await reply(sock, jid, `📝 *Resumo*\n\n${res.choices[0]?.message?.content}`, msg);
        } catch (e) {
            await reply(sock, jid, `❌ Erro: ${e.message}`, msg);
        }
        return;
    }

    // ─── TRADUZIR ─────────────────────────────────────────────────────────
    if (['traduzir', 'translate', 'tradutor'].includes(cmd)) {
        if (args.length < 2) return reply(sock, jid, `❌ Use: ${prefixo}traduzir <idioma> <texto>\nEx: ${prefixo}traduzir inglês Olá mundo`, msg);
        const idioma = args[0];
        const textoTraduzir = args.slice(1).join(' ');
        if (!openaiKey) return reply(sock, jid, '❌ API Key da OpenAI não configurada!', msg);
        try {
            await react(sock, msg, '🌐');
            const { default: OpenAI } = await import('openai');
            const client = new OpenAI({ apiKey: openaiKey });
            const res = await client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: `Traduza para ${idioma}: "${textoTraduzir}"` }],
                max_tokens: 300,
            });
            await reply(sock, jid, `🌐 *Tradução para ${idioma}*\n\n${res.choices[0]?.message?.content}`, msg);
        } catch (e) {
            await reply(sock, jid, `❌ Erro: ${e.message}`, msg);
        }
        return;
    }

    // ─── HISTÓRIA ─────────────────────────────────────────────────────────
    if (['historia', 'story', 'conto', 'aventura'].includes(cmd)) {
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}historia <tema>`, msg);
        if (!openaiKey) return reply(sock, jid, '❌ API Key da OpenAI não configurada!', msg);
        try {
            await react(sock, msg, '📖');
            const { default: OpenAI } = await import('openai');
            const client = new OpenAI({ apiKey: openaiKey });
            const res = await client.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Crie histórias curtas e criativas em português.' },
                    { role: 'user', content: `Crie uma história curta sobre: ${text}` }
                ],
                max_tokens: 500,
            });
            await reply(sock, jid, `📖 *História: ${text}*\n\n${res.choices[0]?.message?.content}`, msg);
        } catch (e) {
            await reply(sock, jid, `❌ Erro: ${e.message}`, msg);
        }
        return;
    }

    // ─── ADMIN: BAN ───────────────────────────────────────────────────────
    if (['ban', 'banir', 'expulsar'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!(await isBotAdmin(sock, jid))) return reply(sock, jid, '❌ Preciso ser admin para banir!', msg);
        const target = mentioned[0];
        if (!target) return reply(sock, jid, `❌ Use: ${prefixo}ban @usuario`, msg);
        try {
            await sock.groupParticipantsUpdate(jid, [target], 'remove');
            await react(sock, msg, '🔨');
            await reply(sock, jid, `🔨 *Ban aplicado!*\n\n@${getMention(target)} foi banido do grupo!`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao banir usuário!', msg);
        }
        return;
    }

    // ─── ADMIN: KICK ──────────────────────────────────────────────────────
    if (['kick', 'remover', 'remove'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!(await isBotAdmin(sock, jid))) return reply(sock, jid, '❌ Preciso ser admin para remover!', msg);
        const target = mentioned[0];
        if (!target) return reply(sock, jid, `❌ Use: ${prefixo}kick @usuario`, msg);
        try {
            await sock.groupParticipantsUpdate(jid, [target], 'remove');
            await react(sock, msg, '👢');
            await reply(sock, jid, `👢 @${getMention(target)} foi removido do grupo!`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao remover usuário!', msg);
        }
        return;
    }

    // ─── ADMIN: ADD ───────────────────────────────────────────────────────
    if (['add', 'adicionar', 'convidar'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!(await isBotAdmin(sock, jid))) return reply(sock, jid, '❌ Preciso ser admin para adicionar!', msg);
        const numero = text.replace(/\D/g, '');
        if (!numero) return reply(sock, jid, `❌ Use: ${prefixo}add <número>`, msg);
        try {
            await sock.groupParticipantsUpdate(jid, [`${numero}@s.whatsapp.net`], 'add');
            await reply(sock, jid, `✅ ${numero} foi adicionado ao grupo!`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao adicionar. O número pode não ter WhatsApp ou o grupo pode estar cheio!', msg);
        }
        return;
    }

    // ─── ADMIN: PROMOVER ──────────────────────────────────────────────────
    if (['promover', 'promote', 'admin'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!(await isBotAdmin(sock, jid))) return reply(sock, jid, '❌ Preciso ser admin para promover!', msg);
        const target = mentioned[0];
        if (!target) return reply(sock, jid, `❌ Use: ${prefixo}promover @usuario`, msg);
        try {
            await sock.groupParticipantsUpdate(jid, [target], 'promote');
            await react(sock, msg, '⬆️');
            await reply(sock, jid, `⬆️ @${getMention(target)} foi promovido a admin!`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao promover!', msg);
        }
        return;
    }

    // ─── ADMIN: REBAIXAR ──────────────────────────────────────────────────
    if (['rebaixar', 'demote', 'desadmin'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!(await isBotAdmin(sock, jid))) return reply(sock, jid, '❌ Preciso ser admin para rebaixar!', msg);
        const target = mentioned[0];
        if (!target) return reply(sock, jid, `❌ Use: ${prefixo}rebaixar @usuario`, msg);
        try {
            await sock.groupParticipantsUpdate(jid, [target], 'demote');
            await react(sock, msg, '⬇️');
            await reply(sock, jid, `⬇️ @${getMention(target)} foi rebaixado!`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao rebaixar!', msg);
        }
        return;
    }

    // ─── ADMIN: ADVERTÊNCIA ───────────────────────────────────────────────
    if (['adv', 'advertir', 'warn', 'aviso'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        const target = mentioned[0];
        if (!target) return reply(sock, jid, `❌ Use: ${prefixo}adv @usuario <motivo>`, msg);
        const motivo = args.slice(1).join(' ') || 'Sem motivo informado';
        const warns = await addWarning(target, jid);
        const total = warns;
        if (total >= 3) {
            try {
                await sock.groupParticipantsUpdate(jid, [target], 'remove');
                await resetWarnings(target, jid);
                await reply(sock, jid, `🔨 @${getMention(target)} atingiu 3 advertências e foi *banido automaticamente*!`, msg);
            } catch {
                await reply(sock, jid, `⚠️ @${getMention(target)} atingiu 3 advertências mas não consegui banir (sem permissão).`, msg);
            }
        } else {
            await reply(sock, jid, `⚠️ *Advertência ${total}/3*\n\n👤 @${getMention(target)}\n📝 Motivo: ${motivo}\n\n⚠️ Na 3ª advertência, o usuário será banido!`, msg);
        }
        return;
    }

    // ─── ADMIN: VER ADVERTÊNCIAS ──────────────────────────────────────────
    if (['advsver', 'veradvs', 'warns', 'advertencias'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        const target = mentioned[0] || sender;
        const total = await getWarnings(target, jid);
        await reply(sock, jid, `⚠️ *Advertências de @${getMention(target)}*\n\n📊 Total: *${total}/3*\n${'⚠️'.repeat(total)}${'⬜'.repeat(3 - total)}`, msg);
        return;
    }

    // ─── ADMIN: REMOVER ADVERTÊNCIAS ─────────────────────────────────────
    if (['rmadv', 'removeradv', 'clearwarn', 'limparadv'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        const target = mentioned[0];
        if (!target) return reply(sock, jid, `❌ Use: ${prefixo}rmadv @usuario`, msg);
        await resetWarnings(target, jid);
        await reply(sock, jid, `✅ Advertências de @${getMention(target)} foram removidas!`, msg);
        return;
    }

    // ─── ADMIN: MUTE ──────────────────────────────────────────────────────
    if (['mute', 'silenciar', 'fechar'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!(await isBotAdmin(sock, jid))) return reply(sock, jid, '❌ Preciso ser admin!', msg);
        try {
            await sock.groupSettingUpdate(jid, 'announcement');
            await reply(sock, jid, '🔇 Grupo *fechado*! Apenas admins podem enviar mensagens.', msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao fechar o grupo!', msg);
        }
        return;
    }

    // ─── ADMIN: UNMUTE ────────────────────────────────────────────────────
    if (['unmute', 'abrir', 'dessilenciar'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!(await isBotAdmin(sock, jid))) return reply(sock, jid, '❌ Preciso ser admin!', msg);
        try {
            await sock.groupSettingUpdate(jid, 'not_announcement');
            await reply(sock, jid, '🔊 Grupo *aberto*! Todos podem enviar mensagens.', msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao abrir o grupo!', msg);
        }
        return;
    }

    // ─── ADMIN: NOME DO GRUPO ─────────────────────────────────────────────
    if (['nomegrupo', 'renomear', 'setname'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}nomegrupo <novo nome>`, msg);
        try {
            await sock.groupUpdateSubject(jid, text);
            await reply(sock, jid, `✅ Nome do grupo alterado para: *${text}*`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao alterar nome!', msg);
        }
        return;
    }

    // ─── ADMIN: DESCRIÇÃO DO GRUPO ────────────────────────────────────────
    if (['descgrupo', 'setdesc', 'descricao'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}descgrupo <descrição>`, msg);
        try {
            await sock.groupUpdateDescription(jid, text);
            await reply(sock, jid, `✅ Descrição do grupo atualizada!`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao alterar descrição!', msg);
        }
        return;
    }

    // ─── ADMIN: LINK DO GRUPO ─────────────────────────────────────────────
    if (['linkinvite', 'linkgrupo', 'invite', 'link'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        try {
            const code = await sock.groupInviteCode(jid);
            await reply(sock, jid, `🔗 *Link do Grupo*\n\nhttps://chat.whatsapp.com/${code}`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao obter link!', msg);
        }
        return;
    }

    // ─── ADMIN: REVOGAR LINK ──────────────────────────────────────────────
    if (['revogarlink', 'revokelink', 'novolink'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        try {
            await sock.groupRevokeInvite(jid);
            await reply(sock, jid, '✅ Link do grupo revogado! Um novo link foi gerado.', msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao revogar link!', msg);
        }
        return;
    }

    // ─── ADMIN: TAG ALL ───────────────────────────────────────────────────
    if (['tagall', 'marcarall', 'todos', 'everyone'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        try {
            const meta = await sock.groupMetadata(jid);
            const participantes = meta.participants.map(p => p.id);
            const mentions = participantes;
            const mensagem = text || '📢 Atenção a todos!';
            const tags = participantes.map(p => `@${getMention(p)}`).join(' ');
            await sock.sendMessage(jid, { text: `📢 *${mensagem}*\n\n${tags}`, mentions }, { quoted: msg });
        } catch {
            await reply(sock, jid, '❌ Erro ao marcar todos!', msg);
        }
        return;
    }

    // ─── ADMIN: LISTAR MEMBROS ────────────────────────────────────────────
    if (['listar', 'membros', 'members', 'participantes'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        try {
            const meta = await sock.groupMetadata(jid);
            const admins = meta.participants.filter(p => p.admin).map(p => `👑 @${getMention(p.id)}`);
            const membros = meta.participants.filter(p => !p.admin).map(p => `👤 @${getMention(p.id)}`);
            const total = meta.participants.length;
            await reply(sock, jid, `👥 *Membros do Grupo*\n\n📊 Total: *${total}*\n\n*Admins (${admins.length}):*\n${admins.join('\n')}\n\n*Membros (${membros.length}):*\n${membros.slice(0, 20).join('\n')}${membros.length > 20 ? `\n... e mais ${membros.length - 20}` : ''}`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao listar membros!', msg);
        }
        return;
    }

    // ─── ADMIN: ANTILINK ──────────────────────────────────────────────────
    if (['antilink', 'antlink'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        const status = args[0]?.toLowerCase();
        if (!['on', 'off', 'ativar', 'desativar'].includes(status)) return reply(sock, jid, `❌ Use: ${prefixo}antilink on/off`, msg);
        const ativo = ['on', 'ativar'].includes(status);
        await setGroupSettings(jid, 'antilink', ativo ? 1 : 0);
        await reply(sock, jid, `${ativo ? '🔒' : '🔓'} Anti-link *${ativo ? 'ativado' : 'desativado'}*!`, msg);
        return;
    }

    // ─── ADMIN: BOAS-VINDAS ───────────────────────────────────────────────
    if (['boasvindas', 'welcome', 'bemvindo'].includes(cmd)) {
        if (!fromGroup) return reply(sock, jid, '❌ Este comando é apenas para grupos!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        const status = args[0]?.toLowerCase();
        if (!['on', 'off', 'ativar', 'desativar'].includes(status)) return reply(sock, jid, `❌ Use: ${prefixo}boasvindas on/off`, msg);
        const ativo = ['on', 'ativar'].includes(status);
        await setGroupSettings(jid, 'welcome', ativo ? 1 : 0);
        await reply(sock, jid, `${ativo ? '👋' : '🚫'} Boas-vindas *${ativo ? 'ativadas' : 'desativadas'}*!`, msg);
        return;
    }

    // ─── ADMIN: SETPREFIX ─────────────────────────────────────────────────
    if (['setprefix', 'prefixo', 'changeprefix'].includes(cmd)) {
        if (!isDono && !fromGroup) return reply(sock, jid, '❌ Apenas o dono pode alterar o prefixo!', msg);
        if (!isDono && !(await isAdmin(sock, jid, sender))) return reply(sock, jid, '❌ Apenas admins podem usar este comando!', msg);
        if (!args[0]) return reply(sock, jid, `❌ Use: ${prefixo}setprefix <novo prefixo>`, msg);
        config.prefixo = args[0];
        try {
            const configPath = path.join(__dirname, 'config.json');
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await reply(sock, jid, `✅ Prefixo alterado para: *${args[0]}*`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao salvar prefixo!', msg);
        }
        return;
    }

    // ─── DONO: RESTART ────────────────────────────────────────────────────
    if (['restart', 'reiniciar', 'reboot'].includes(cmd)) {
        if (!isDono) return reply(sock, jid, '❌ Apenas o dono pode reiniciar o bot!', msg);
        await reply(sock, jid, '🔄 Reiniciando o bot...', msg);
        setTimeout(() => process.exit(0), 1000);
        return;
    }

    // ─── DONO: EVAL ───────────────────────────────────────────────────────
    if (['eval', 'exec', 'run'].includes(cmd)) {
        if (!isDono) return reply(sock, jid, '❌ Apenas o dono pode usar este comando!', msg);
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}eval <código>`, msg);
        try {
            let resultado = await eval(text);
            if (typeof resultado === 'object') resultado = JSON.stringify(resultado, null, 2);
            await reply(sock, jid, `✅ *Resultado:*\n\`\`\`${resultado}\`\`\``, msg);
        } catch (e) {
            await reply(sock, jid, `❌ *Erro:*\n\`\`\`${e.message}\`\`\``, msg);
        }
        return;
    }

    // ─── DONO: BROADCAST ──────────────────────────────────────────────────
    if (['broadcast', 'bc', 'anuncio'].includes(cmd)) {
        if (!isDono) return reply(sock, jid, '❌ Apenas o dono pode usar este comando!', msg);
        if (!text) return reply(sock, jid, `❌ Use: ${prefixo}broadcast <mensagem>`, msg);
        try {
            const chats = await sock.groupFetchAllParticipating();
            const grupos = Object.keys(chats);
            let enviados = 0;
            for (const g of grupos) {
                try {
                    await sock.sendMessage(g, { text: `📢 *Broadcast — ${nomebot}*\n\n${text}` });
                    enviados++;
                    await new Promise(r => setTimeout(r, 500));
                } catch { }
            }
            await reply(sock, jid, `✅ Broadcast enviado para *${enviados}* grupos!`, msg);
        } catch (e) {
            await reply(sock, jid, `❌ Erro no broadcast: ${e.message}`, msg);
        }
        return;
    }

    // ─── DONO: MENU DONO ──────────────────────────────────────────────────
    if (['menudono', 'menuowner', 'cmddono'].includes(cmd)) {
        if (!isDono) return reply(sock, jid, '❌ Apenas o dono pode ver este menu!', msg);
        const t = `╭┈⊰ 🌙 『 *${nomebot}* 』
┊Olá, *${nomedono || senderName}*!
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯

╭┈❁ *👑 MENU DO DONO*
┊
┊•.̇𖥨֗🍓⭟ ${prefixo}restart
┊•.̇𖥨֗🍓⭟ ${prefixo}eval <código>
┊•.̇𖥨֗🍓⭟ ${prefixo}broadcast <msg>
┊•.̇𖥨֗🍓⭟ ${prefixo}setprefix <novo>
┊•.̇𖥨֗🍓⭟ ${prefixo}uptime
┊•.̇𖥨֗🍓⭟ ${prefixo}ping
╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯`;
        await reply(sock, jid, t, msg);
        return;
    }

    // ─── COMANDO NÃO ENCONTRADO ───────────────────────────────────────────
    // (Silencioso — não responde para não poluir o grupo)
}
