/**
 * 🌙 NOCTURNUS - Handler Principal de Comandos
 * Baseado na arquitetura do Nazuna
 */

import { getContentType } from 'whaileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB, getUser, createUser, addXP, addCoins, removeCoins, getCooldown, setCooldown, getGroupSettings, setGroupSettings, getWarnings, addWarning, resetWarnings, getRanking } from './utils/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar banco de dados
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
    const options = quoted ? { quoted } : {};
    return sock.sendMessage(jid, { text }, options);
}

async function isAdmin(sock, jid, sender) {
    try {
        const meta = await sock.groupMetadata(jid);
        return meta.participants.some(p =>
            (p.id === sender || p.id?.split(':')[0] + '@s.whatsapp.net' === sender) &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        );
    } catch { return false; }
}

async function isBotAdmin(sock, jid) {
    try {
        const meta = await sock.groupMetadata(jid);
        const botId = sock.user?.id?.replace(/:.*@/, '@') || '';
        return meta.participants.some(p =>
            (p.id === botId || p.id?.split(':')[0] + '@s.whatsapp.net' === botId) &&
            (p.admin === 'admin' || p.admin === 'superadmin')
        );
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

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────

export default async function handler(sock, msg, config) {
    const { prefixo, nomebot, nomedono = '', numerodono, openaiKey = '' } = config;

    const jid = getJid(msg);
    const sender = getSender(msg);
    const body = getBody(msg);
    const fromGroup = isGroup(jid);
    const fromMe = isFromMe(msg);
    const pushName = msg.pushName || 'Usuário';

    if (!body || !jid) return;

    // Ignorar mensagens do próprio bot (exceto comandos de dono)
    const senderNumber = sender.replace('@s.whatsapp.net', '').replace(/:.*/, '');
    const isOwner = senderNumber === numerodono || fromMe;

    // Verificar se é comando
    if (!body.startsWith(prefixo)) return;

    const args = body.slice(prefixo.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // Garantir usuário no banco
    let user = await getUser(sender);
    if (!user) {
        await createUser(sender, pushName);
        user = await getUser(sender);
    }

    // Configurações do grupo
    let groupSettings = null;
    if (fromGroup) {
        groupSettings = await getGroupSettings(jid);
    }

    // ─── COMANDOS ─────────────────────────────────────────────────────────

    // ══════════════════════════════════════
    // 🔧 UTILIDADES
    // ══════════════════════════════════════

    if (command === 'ping' || command === 'pong') {
        const start = Date.now();
        const m = await reply(sock, jid, '🏓 Calculando...', msg);
        const latency = Date.now() - start;
        await react(sock, msg, '⚡');
        await reply(sock, jid,
            `╔══════════════════════╗\n` +
            `║  ⚡ NOCTURNUS PING   ║\n` +
            `╠══════════════════════╣\n` +
            `║  🏓 Pong!            ║\n` +
            `║  ⏱️ Latência: ${latency}ms  ║\n` +
            `╚══════════════════════╝`,
            msg
        );
        return;
    }

    if (command === 'menu' || command === 'ajuda' || command === 'help' || command === 'comandos') {
        const cat = args[0]?.toLowerCase();
        let text = '';

        if (!cat) {
            text =
                `╔═══════════════════════════════════╗\n` +
                `║  🌙 *${nomebot}* - Menu Principal  ║\n` +
                `╠═══════════════════════════════════╣\n` +
                `║                                   ║\n` +
                `║  ${prefixo}menu admin  → Admin de Grupos  ║\n` +
                `║  ${prefixo}menu rpg    → RPG & Economia   ║\n` +
                `║  ${prefixo}menu fun    → Diversão         ║\n` +
                `║  ${prefixo}menu ia     → Inteligência IA  ║\n` +
                `║  ${prefixo}menu util   → Utilidades       ║\n` +
                `║                                   ║\n` +
                `║  🔣 Prefixo: *${prefixo}*                ║\n` +
                `║  👤 Dono: *${nomedono || 'Não definido'}*          ║\n` +
                `╚═══════════════════════════════════╝`;
        } else if (cat === 'admin') {
            text =
                `╔══════════════════════════════╗\n` +
                `║  🔐 *COMANDOS ADMIN*         ║\n` +
                `╠══════════════════════════════╣\n` +
                `║  ${prefixo}ban @user      → Banir      ║\n` +
                `║  ${prefixo}kick @user     → Remover    ║\n` +
                `║  ${prefixo}promover @user → Admin      ║\n` +
                `║  ${prefixo}rebaixar @user → -Admin     ║\n` +
                `║  ${prefixo}adv @user      → Advertir   ║\n` +
                `║  ${prefixo}adv @user ver  → Ver advs   ║\n` +
                `║  ${prefixo}adv @user reset→ Resetar    ║\n` +
                `║  ${prefixo}setprefix <x>  → Prefixo   ║\n` +
                `╚══════════════════════════════╝`;
        } else if (cat === 'rpg') {
            text =
                `╔══════════════════════════════╗\n` +
                `║  🎮 *COMANDOS RPG*           ║\n` +
                `╠══════════════════════════════╣\n` +
                `║  ${prefixo}perfil        → Seu perfil  ║\n` +
                `║  ${prefixo}trabalhar     → Ganhar 💰   ║\n` +
                `║  ${prefixo}minerar       → Minerar 💎  ║\n` +
                `║  ${prefixo}pescar        → Pescar 🎣   ║\n` +
                `║  ${prefixo}ranking       → Top players ║\n` +
                `║  ${prefixo}dar @u <val>  → Transferir  ║\n` +
                `╚══════════════════════════════╝`;
        } else if (cat === 'fun') {
            text =
                `╔══════════════════════════════╗\n` +
                `║  🎭 *COMANDOS DIVERSÃO*      ║\n` +
                `╠══════════════════════════════╣\n` +
                `║  ${prefixo}dado          → Jogar dado  ║\n` +
                `║  ${prefixo}moeda         → Cara/Coroa  ║\n` +
                `║  ${prefixo}quiz          → Quiz        ║\n` +
                `║  ${prefixo}8ball <perg>  → Bola mágica ║\n` +
                `║  ${prefixo}rolar <NdN>   → Dados RPG   ║\n` +
                `╚══════════════════════════════╝`;
        } else if (cat === 'ia') {
            text =
                `╔══════════════════════════════╗\n` +
                `║  🤖 *COMANDOS IA*            ║\n` +
                `╠══════════════════════════════╣\n` +
                `║  ${prefixo}gpt <pergunta> → Chat IA    ║\n` +
                `║  ${prefixo}explicar <x>   → Explicar   ║\n` +
                `║  ${prefixo}resumir <x>    → Resumir    ║\n` +
                `║                              ║\n` +
                `║  ⚠️ Requer API Key           ║\n` +
                `╚══════════════════════════════╝`;
        } else if (cat === 'util') {
            text =
                `╔══════════════════════════════╗\n` +
                `║  🔧 *UTILIDADES*             ║\n` +
                `╠══════════════════════════════╣\n` +
                `║  ${prefixo}ping          → Latência    ║\n` +
                `║  ${prefixo}encurtar <url>→ Encurtar    ║\n` +
                `║  ${prefixo}calc <expr>   → Calculadora ║\n` +
                `║  ${prefixo}clima <cidade>→ Clima       ║\n` +
                `╚══════════════════════════════╝`;
        } else {
            text = `❌ Categoria inválida! Use: admin, rpg, fun, ia, util`;
        }

        await react(sock, msg, '📋');
        await reply(sock, jid, text, msg);
        return;
    }

    // ══════════════════════════════════════
    // 🎮 RPG & ECONOMIA
    // ══════════════════════════════════════

    if (command === 'perfil' || command === 'profile' || command === 'p') {
        const level = getLevel(user.xp || 0);
        const nextXP = xpForNextLevel(level);
        const progress = Math.min(Math.floor(((user.xp || 0) / nextXP) * 10), 10);
        const bar = '█'.repeat(progress) + '░'.repeat(10 - progress);

        const text =
            `╔══════════════════════════════╗\n` +
            `║  🌙 *PERFIL NOCTURNUS*       ║\n` +
            `╠══════════════════════════════╣\n` +
            `║  👤 ${(user.name || pushName).slice(0, 20).padEnd(20)}  ║\n` +
            `║  🏆 Nível: *${String(level).padEnd(17)}*  ║\n` +
            `║  ⭐ XP: *${formatNumber(user.xp || 0).padEnd(19)}*  ║\n` +
            `║  💰 Moedas: *${formatNumber(user.coins || 0).padEnd(16)}*  ║\n` +
            `║                              ║\n` +
            `║  📊 Progresso:               ║\n` +
            `║  [${bar}]  ║\n` +
            `║  ${formatNumber(user.xp || 0)}/${formatNumber(nextXP)} XP  ║\n` +
            `╚══════════════════════════════╝`;

        await react(sock, msg, '👤');
        await reply(sock, jid, text, msg);
        return;
    }

    if (command === 'trabalhar' || command === 'work' || command === 't') {
        const cooldownKey = `work_${sender}`;
        const cd = await getCooldown(cooldownKey);
        if (cd) {
            const left = Math.ceil((cd - Date.now()) / 1000);
            await reply(sock, jid, `⏳ Aguarde *${left}s* para trabalhar novamente!`, msg);
            return;
        }

        const jobs = [
            { name: 'Programador', min: 80, max: 200, emoji: '💻' },
            { name: 'Médico', min: 100, max: 250, emoji: '🏥' },
            { name: 'Professor', min: 60, max: 150, emoji: '📚' },
            { name: 'Engenheiro', min: 90, max: 220, emoji: '⚙️' },
            { name: 'Chef', min: 70, max: 180, emoji: '👨‍🍳' },
            { name: 'Músico', min: 50, max: 160, emoji: '🎵' },
            { name: 'Motorista', min: 60, max: 140, emoji: '🚗' },
            { name: 'Agricultor', min: 55, max: 130, emoji: '🌾' },
        ];

        const job = jobs[random(0, jobs.length - 1)];
        const earned = random(job.min, job.max);
        const xpEarned = random(5, 20);

        await addCoins(sender, earned);
        await addXP(sender, xpEarned);
        await setCooldown(cooldownKey, 60 * 1000); // 1 minuto

        await react(sock, msg, '💼');
        await reply(sock, jid,
            `${job.emoji} *Você trabalhou como ${job.name}!*\n\n` +
            `💰 Ganhou: *+${formatNumber(earned)} moedas*\n` +
            `⭐ XP: *+${xpEarned} XP*\n\n` +
            `⏳ Próximo trabalho em *60s*`,
            msg
        );
        return;
    }

    if (command === 'minerar' || command === 'mine' || command === 'm') {
        const cooldownKey = `mine_${sender}`;
        const cd = await getCooldown(cooldownKey);
        if (cd) {
            const left = Math.ceil((cd - Date.now()) / 1000);
            await reply(sock, jid, `⏳ Aguarde *${left}s* para minerar novamente!`, msg);
            return;
        }

        const minerals = [
            { name: 'Carvão', min: 20, max: 60, emoji: '🪨' },
            { name: 'Ferro', min: 40, max: 100, emoji: '⚙️' },
            { name: 'Ouro', min: 80, max: 200, emoji: '🥇' },
            { name: 'Diamante', min: 150, max: 400, emoji: '💎' },
            { name: 'Esmeralda', min: 200, max: 500, emoji: '💚' },
        ];

        const weights = [40, 30, 20, 7, 3];
        let roll = random(1, 100);
        let mineral = minerals[0];
        let acc = 0;
        for (let i = 0; i < weights.length; i++) {
            acc += weights[i];
            if (roll <= acc) { mineral = minerals[i]; break; }
        }

        const earned = random(mineral.min, mineral.max);
        const xpEarned = random(10, 30);

        await addCoins(sender, earned);
        await addXP(sender, xpEarned);
        await setCooldown(cooldownKey, 2 * 60 * 1000); // 2 minutos

        await react(sock, msg, '⛏️');
        await reply(sock, jid,
            `${mineral.emoji} *Você minerou ${mineral.name}!*\n\n` +
            `💰 Ganhou: *+${formatNumber(earned)} moedas*\n` +
            `⭐ XP: *+${xpEarned} XP*\n\n` +
            `⏳ Próxima mineração em *2min*`,
            msg
        );
        return;
    }

    if (command === 'pescar' || command === 'fish' || command === 'f') {
        const cooldownKey = `fish_${sender}`;
        const cd = await getCooldown(cooldownKey);
        if (cd) {
            const left = Math.ceil((cd - Date.now()) / 1000);
            await reply(sock, jid, `⏳ Aguarde *${left}s* para pescar novamente!`, msg);
            return;
        }

        const fishes = [
            { name: 'Sardinha', min: 15, max: 40, emoji: '🐟' },
            { name: 'Tilápia', min: 30, max: 70, emoji: '🐠' },
            { name: 'Salmão', min: 60, max: 150, emoji: '🐡' },
            { name: 'Atum', min: 100, max: 250, emoji: '🦈' },
            { name: 'Lula Gigante', min: 200, max: 500, emoji: '🦑' },
        ];

        const weights = [40, 30, 20, 8, 2];
        let roll = random(1, 100);
        let fish = fishes[0];
        let acc = 0;
        for (let i = 0; i < weights.length; i++) {
            acc += weights[i];
            if (roll <= acc) { fish = fishes[i]; break; }
        }

        const earned = random(fish.min, fish.max);
        const xpEarned = random(8, 25);

        await addCoins(sender, earned);
        await addXP(sender, xpEarned);
        await setCooldown(cooldownKey, 90 * 1000); // 1.5 minutos

        await react(sock, msg, '🎣');
        await reply(sock, jid,
            `${fish.emoji} *Você pescou um(a) ${fish.name}!*\n\n` +
            `💰 Ganhou: *+${formatNumber(earned)} moedas*\n` +
            `⭐ XP: *+${xpEarned} XP*\n\n` +
            `⏳ Próxima pesca em *90s*`,
            msg
        );
        return;
    }

    if (command === 'ranking' || command === 'rank' || command === 'top') {
        const tipo = args[0]?.toLowerCase() === 'coins' ? 'coins' : 'xp';
        const top = await getRanking(tipo, 10);

        let text = `╔══════════════════════════════╗\n`;
        text += `║  🏆 *RANKING - ${tipo.toUpperCase().padEnd(12)}*  ║\n`;
        text += `╠══════════════════════════════╣\n`;

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        top.forEach((u, i) => {
            const val = tipo === 'xp' ? `${formatNumber(u.xp)} XP` : `${formatNumber(u.coins)} 💰`;
            text += `║ ${medals[i]} ${(u.name || 'Usuário').slice(0, 14).padEnd(14)} ${val.padEnd(10)} ║\n`;
        });

        text += `╚══════════════════════════════╝`;

        await react(sock, msg, '🏆');
        await reply(sock, jid, text, msg);
        return;
    }

    if (command === 'dar' || command === 'transferir') {
        if (!fromGroup) {
            await reply(sock, jid, '❌ Use este comando em um grupo!', msg);
            return;
        }
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0];
        const amount = parseInt(args[1] || args[0]);

        if (!target || isNaN(amount) || amount <= 0) {
            await reply(sock, jid, `❌ Uso: *${prefixo}dar @usuario <valor>*`, msg);
            return;
        }
        if (amount > (user.coins || 0)) {
            await reply(sock, jid, `❌ Você não tem moedas suficientes! Saldo: *${formatNumber(user.coins || 0)}*`, msg);
            return;
        }

        let targetUser = await getUser(target);
        if (!targetUser) {
            await createUser(target, 'Usuário');
            targetUser = await getUser(target);
        }

        await removeCoins(sender, amount);
        await addCoins(target, amount);

        await react(sock, msg, '💸');
        await reply(sock, jid,
            `💸 *Transferência realizada!*\n\n` +
            `💰 Valor: *${formatNumber(amount)} moedas*\n` +
            `📤 De: @${sender.split('@')[0]}\n` +
            `📥 Para: @${target.split('@')[0]}`,
            msg
        );
        return;
    }

    // ══════════════════════════════════════
    // 🎭 DIVERSÃO
    // ══════════════════════════════════════

    if (command === 'dado' || command === 'dice' || command === 'd') {
        const faces = parseInt(args[0]) || 6;
        if (faces < 2 || faces > 100) {
            await reply(sock, jid, '❌ Use entre 2 e 100 faces!', msg);
            return;
        }
        const result = random(1, faces);
        await react(sock, msg, '🎲');
        await reply(sock, jid,
            `🎲 *Dado de ${faces} faces*\n\n` +
            `Resultado: *${result}*`,
            msg
        );
        return;
    }

    if (command === 'moeda' || command === 'coin' || command === 'flipcoin') {
        const result = random(0, 1) === 0 ? '👑 Cara' : '🔵 Coroa';
        await react(sock, msg, '🪙');
        await reply(sock, jid, `🪙 *Cara ou Coroa*\n\nResultado: *${result}*!`, msg);
        return;
    }

    if (command === 'rolar' || command === 'roll') {
        const notation = args[0] || '1d6';
        const match = notation.match(/^(\d+)d(\d+)$/i);
        if (!match) {
            await reply(sock, jid, `❌ Formato inválido! Use: *${prefixo}rolar 2d6* (2 dados de 6 faces)`, msg);
            return;
        }
        const qtd = Math.min(parseInt(match[1]), 20);
        const faces = Math.min(parseInt(match[2]), 1000);
        const rolls = Array.from({ length: qtd }, () => random(1, faces));
        const total = rolls.reduce((a, b) => a + b, 0);

        await react(sock, msg, '🎲');
        await reply(sock, jid,
            `🎲 *${qtd}d${faces}*\n\n` +
            `Dados: ${rolls.join(', ')}\n` +
            `Total: *${total}*`,
            msg
        );
        return;
    }

    if (command === '8ball' || command === 'bola8') {
        const question = args.join(' ');
        if (!question) {
            await reply(sock, jid, `❌ Faça uma pergunta! Ex: *${prefixo}8ball Vou ter sorte hoje?*`, msg);
            return;
        }
        const answers = [
            '✅ Sim, com certeza!', '✅ Definitivamente sim!', '✅ Muito provável!',
            '✅ Sim!', '🤔 Talvez...', '🤔 Não tenho certeza.',
            '🤔 Pergunte novamente mais tarde.', '❌ Não parece provável.',
            '❌ Não!', '❌ Definitivamente não!', '❌ Minhas fontes dizem não.',
        ];
        const answer = answers[random(0, answers.length - 1)];
        await react(sock, msg, '🎱');
        await reply(sock, jid, `🎱 *Bola Mágica 8*\n\n❓ ${question}\n\n${answer}`, msg);
        return;
    }

    if (command === 'quiz' || command === 'pergunta') {
        const quizzes = [
            { q: 'Qual é a capital da França?', opts: ['A) Londres', 'B) Paris', 'C) Berlim'], a: 'B' },
            { q: 'Qual o planeta mais próximo do Sol?', opts: ['A) Vênus', 'B) Mercúrio', 'C) Terra'], a: 'B' },
            { q: 'Qual o maior oceano do mundo?', opts: ['A) Atlântico', 'B) Índico', 'C) Pacífico'], a: 'C' },
            { q: 'Em que ano terminou a 2ª Guerra Mundial?', opts: ['A) 1943', 'B) 1944', 'C) 1945'], a: 'C' },
            { q: 'Qual o animal terrestre mais rápido?', opts: ['A) Leão', 'B) Guepardo', 'C) Gazela'], a: 'B' },
            { q: 'Quantos lados tem um hexágono?', opts: ['A) 5', 'B) 6', 'C) 7'], a: 'B' },
            { q: 'Qual é o maior planeta do sistema solar?', opts: ['A) Saturno', 'B) Urano', 'C) Júpiter'], a: 'C' },
            { q: 'Qual o idioma mais falado no mundo?', opts: ['A) Inglês', 'B) Mandarim', 'C) Espanhol'], a: 'B' },
        ];

        const quiz = quizzes[random(0, quizzes.length - 1)];
        await react(sock, msg, '❓');
        await reply(sock, jid,
            `❓ *QUIZ*\n\n` +
            `${quiz.q}\n\n` +
            quiz.opts.join('\n') +
            `\n\n💡 Resposta: ||${quiz.a}||`,
            msg
        );
        return;
    }

    // ══════════════════════════════════════
    // 🔐 ADMIN (apenas grupos)
    // ══════════════════════════════════════

    if (command === 'ban' || command === 'banir') {
        if (!fromGroup) { await reply(sock, jid, '❌ Apenas em grupos!', msg); return; }
        if (!await isAdmin(sock, jid, sender) && !isOwner) {
            await reply(sock, jid, '❌ Você precisa ser admin!', msg); return;
        }
        if (!await isBotAdmin(sock, jid)) {
            await reply(sock, jid, '❌ Eu preciso ser admin do grupo!', msg); return;
        }

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0];
        if (!target) { await reply(sock, jid, `❌ Mencione um usuário! Ex: *${prefixo}ban @usuario*`, msg); return; }

        try {
            await sock.groupParticipantsUpdate(jid, [target], 'remove');
            await react(sock, msg, '🔨');
            await reply(sock, jid, `🔨 *@${target.split('@')[0]} foi banido do grupo!*`, msg);
        } catch {
            await reply(sock, jid, '❌ Não foi possível banir este usuário.', msg);
        }
        return;
    }

    if (command === 'kick' || command === 'remover' || command === 'remove') {
        if (!fromGroup) { await reply(sock, jid, '❌ Apenas em grupos!', msg); return; }
        if (!await isAdmin(sock, jid, sender) && !isOwner) {
            await reply(sock, jid, '❌ Você precisa ser admin!', msg); return;
        }
        if (!await isBotAdmin(sock, jid)) {
            await reply(sock, jid, '❌ Eu preciso ser admin do grupo!', msg); return;
        }

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0];
        if (!target) { await reply(sock, jid, `❌ Mencione um usuário! Ex: *${prefixo}kick @usuario*`, msg); return; }

        try {
            await sock.groupParticipantsUpdate(jid, [target], 'remove');
            await react(sock, msg, '👢');
            await reply(sock, jid, `👢 *@${target.split('@')[0]} foi removido do grupo!*`, msg);
        } catch {
            await reply(sock, jid, '❌ Não foi possível remover este usuário.', msg);
        }
        return;
    }

    if (command === 'promover' || command === 'promote') {
        if (!fromGroup) { await reply(sock, jid, '❌ Apenas em grupos!', msg); return; }
        if (!await isAdmin(sock, jid, sender) && !isOwner) {
            await reply(sock, jid, '❌ Você precisa ser admin!', msg); return;
        }
        if (!await isBotAdmin(sock, jid)) {
            await reply(sock, jid, '❌ Eu preciso ser admin do grupo!', msg); return;
        }

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0];
        if (!target) { await reply(sock, jid, `❌ Mencione um usuário! Ex: *${prefixo}promover @usuario*`, msg); return; }

        try {
            await sock.groupParticipantsUpdate(jid, [target], 'promote');
            await react(sock, msg, '⬆️');
            await reply(sock, jid, `⬆️ *@${target.split('@')[0]} foi promovido a admin!*`, msg);
        } catch {
            await reply(sock, jid, '❌ Não foi possível promover este usuário.', msg);
        }
        return;
    }

    if (command === 'rebaixar' || command === 'demote') {
        if (!fromGroup) { await reply(sock, jid, '❌ Apenas em grupos!', msg); return; }
        if (!await isAdmin(sock, jid, sender) && !isOwner) {
            await reply(sock, jid, '❌ Você precisa ser admin!', msg); return;
        }
        if (!await isBotAdmin(sock, jid)) {
            await reply(sock, jid, '❌ Eu preciso ser admin do grupo!', msg); return;
        }

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0];
        if (!target) { await reply(sock, jid, `❌ Mencione um usuário! Ex: *${prefixo}rebaixar @usuario*`, msg); return; }

        try {
            await sock.groupParticipantsUpdate(jid, [target], 'demote');
            await react(sock, msg, '⬇️');
            await reply(sock, jid, `⬇️ *@${target.split('@')[0]} foi rebaixado de admin!*`, msg);
        } catch {
            await reply(sock, jid, '❌ Não foi possível rebaixar este usuário.', msg);
        }
        return;
    }

    if (command === 'adv' || command === 'advertir' || command === 'warn') {
        if (!fromGroup) { await reply(sock, jid, '❌ Apenas em grupos!', msg); return; }
        if (!await isAdmin(sock, jid, sender) && !isOwner) {
            await reply(sock, jid, '❌ Você precisa ser admin!', msg); return;
        }

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const target = mentioned[0];
        if (!target) { await reply(sock, jid, `❌ Mencione um usuário! Ex: *${prefixo}adv @usuario*`, msg); return; }

        const subCmd = args[1]?.toLowerCase();

        if (subCmd === 'ver' || subCmd === 'check') {
            const warns = await getWarnings(target, jid);
            await reply(sock, jid, `⚠️ *@${target.split('@')[0]}* tem *${warns}* advertência(s).`, msg);
            return;
        }

        if (subCmd === 'reset' || subCmd === 'limpar') {
            await resetWarnings(target, jid);
            await reply(sock, jid, `✅ Advertências de *@${target.split('@')[0]}* foram resetadas.`, msg);
            return;
        }

        const motivo = args.slice(1).join(' ') || 'Sem motivo informado';
        const warns = await addWarning(target, jid);

        await react(sock, msg, '⚠️');

        if (warns >= 3) {
            await reply(sock, jid,
                `⚠️ *@${target.split('@')[0]}* recebeu a *3ª advertência* e foi removido!\n` +
                `📝 Motivo: ${motivo}`,
                msg
            );
            if (await isBotAdmin(sock, jid)) {
                try {
                    await sock.groupParticipantsUpdate(jid, [target], 'remove');
                } catch { }
            }
            await resetWarnings(target, jid);
        } else {
            await reply(sock, jid,
                `⚠️ *@${target.split('@')[0]}* recebeu uma advertência! (*${warns}/3*)\n` +
                `📝 Motivo: ${motivo}\n\n` +
                `⚠️ Na 3ª advertência será removido!`,
                msg
            );
        }
        return;
    }

    if (command === 'setprefix' || command === 'prefix') {
        if (!isOwner && !(fromGroup && await isAdmin(sock, jid, sender))) {
            await reply(sock, jid, '❌ Apenas admins ou dono podem alterar o prefixo!', msg); return;
        }
        const newPrefix = args[0];
        if (!newPrefix || newPrefix.length !== 1) {
            await reply(sock, jid, '❌ O prefixo deve ter 1 caractere!', msg); return;
        }

        // Salvar no config.json
        try {
            const configPath = path.join(__dirname, 'config.json');
            const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            cfg.prefixo = newPrefix;
            fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
            await react(sock, msg, '✅');
            await reply(sock, jid, `✅ Prefixo alterado para *${newPrefix}*!`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao salvar prefixo.', msg);
        }
        return;
    }

    // ══════════════════════════════════════
    // 🤖 INTELIGÊNCIA ARTIFICIAL
    // ══════════════════════════════════════

    if (command === 'gpt' || command === 'ia' || command === 'chat') {
        const question = args.join(' ');
        if (!question) {
            await reply(sock, jid, `❌ Faça uma pergunta! Ex: *${prefixo}gpt Qual é a capital do Brasil?*`, msg);
            return;
        }
        if (!openaiKey) {
            await reply(sock, jid, '❌ API Key da OpenAI não configurada! Execute *npm run config*', msg);
            return;
        }

        await react(sock, msg, '🤖');
        await sock.sendPresenceUpdate('composing', jid);

        try {
            const { default: axios } = await import('axios');
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: `Você é ${nomebot}, um assistente de WhatsApp. Responda de forma clara e objetiva em português.` },
                        { role: 'user', content: question }
                    ],
                    max_tokens: 500,
                },
                { headers: { Authorization: `Bearer ${openaiKey}` } }
            );
            const answer = response.data.choices[0].message.content;
            await sock.sendPresenceUpdate('paused', jid);
            await reply(sock, jid, `🤖 *${nomebot} IA*\n\n${answer}`, msg);
        } catch (err) {
            await sock.sendPresenceUpdate('paused', jid);
            await reply(sock, jid, `❌ Erro na IA: ${err.response?.data?.error?.message || err.message}`, msg);
        }
        return;
    }

    if (command === 'explicar' || command === 'explain') {
        const concept = args.join(' ');
        if (!concept) { await reply(sock, jid, `❌ Use: *${prefixo}explicar <conceito>*`, msg); return; }
        if (!openaiKey) { await reply(sock, jid, '❌ API Key não configurada!', msg); return; }

        await react(sock, msg, '📖');
        await sock.sendPresenceUpdate('composing', jid);

        try {
            const { default: axios } = await import('axios');
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: `Explique "${concept}" de forma simples e clara em no máximo 5 linhas, em português.` }],
                    max_tokens: 300,
                },
                { headers: { Authorization: `Bearer ${openaiKey}` } }
            );
            const answer = response.data.choices[0].message.content;
            await sock.sendPresenceUpdate('paused', jid);
            await reply(sock, jid, `📖 *Explicação: ${concept}*\n\n${answer}`, msg);
        } catch (err) {
            await sock.sendPresenceUpdate('paused', jid);
            await reply(sock, jid, `❌ Erro na IA: ${err.message}`, msg);
        }
        return;
    }

    if (command === 'resumir' || command === 'resumo' || command === 'summarize') {
        const text = args.join(' ');
        if (!text || text.length < 30) { await reply(sock, jid, `❌ Use: *${prefixo}resumir <texto longo>*`, msg); return; }
        if (!openaiKey) { await reply(sock, jid, '❌ API Key não configurada!', msg); return; }

        await react(sock, msg, '📝');
        await sock.sendPresenceUpdate('composing', jid);

        try {
            const { default: axios } = await import('axios');
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-4o-mini',
                    messages: [{ role: 'user', content: `Resuma o seguinte texto em no máximo 3 linhas, em português:\n\n${text}` }],
                    max_tokens: 200,
                },
                { headers: { Authorization: `Bearer ${openaiKey}` } }
            );
            const answer = response.data.choices[0].message.content;
            await sock.sendPresenceUpdate('paused', jid);
            await reply(sock, jid, `📝 *Resumo*\n\n${answer}`, msg);
        } catch (err) {
            await sock.sendPresenceUpdate('paused', jid);
            await reply(sock, jid, `❌ Erro na IA: ${err.message}`, msg);
        }
        return;
    }

    // ══════════════════════════════════════
    // 🔧 UTILIDADES
    // ══════════════════════════════════════

    if (command === 'calc' || command === 'calcular') {
        const expr = args.join(' ');
        if (!expr) { await reply(sock, jid, `❌ Use: *${prefixo}calc 2+2*`, msg); return; }

        try {
            // Seguro: apenas operações matemáticas
            const sanitized = expr.replace(/[^0-9+\-*/().%\s]/g, '');
            if (!sanitized) throw new Error('Expressão inválida');
            const result = Function(`"use strict"; return (${sanitized})`)();
            await react(sock, msg, '🧮');
            await reply(sock, jid, `🧮 *Calculadora*\n\n${expr} = *${result}*`, msg);
        } catch {
            await reply(sock, jid, '❌ Expressão matemática inválida!', msg);
        }
        return;
    }

    if (command === 'encurtar' || command === 'shorten') {
        const url = args[0];
        if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
            await reply(sock, jid, `❌ Use: *${prefixo}encurtar <URL>*`, msg); return;
        }

        try {
            const { default: axios } = await import('axios');
            const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            await react(sock, msg, '🔗');
            await reply(sock, jid, `🔗 *Link Encurtado!*\n\n📎 Original: ${url}\n✂️ Encurtado: ${response.data}`, msg);
        } catch {
            await reply(sock, jid, '❌ Erro ao encurtar link!', msg);
        }
        return;
    }

    // ══════════════════════════════════════
    // 👑 DONO
    // ══════════════════════════════════════

    if (command === 'restart' || command === 'reiniciar' || command === 'reboot') {
        if (!isOwner) { await reply(sock, jid, '❌ Apenas o dono pode usar este comando!', msg); return; }
        await react(sock, msg, '🔄');
        await reply(sock, jid, '🔄 Reiniciando...', msg);
        setTimeout(() => process.exit(0), 1000);
        return;
    }

    if (command === 'eval' || command === 'executar') {
        if (!isOwner) { await reply(sock, jid, '❌ Apenas o dono pode usar este comando!', msg); return; }
        const code = args.join(' ');
        if (!code) { await reply(sock, jid, `❌ Use: *${prefixo}eval <código>*`, msg); return; }

        try {
            let result = eval(code);
            if (result instanceof Promise) result = await result;
            await react(sock, msg, '✅');
            await reply(sock, jid, `✅ *Resultado:*\n\`\`\`${String(result)}\`\`\``, msg);
        } catch (err) {
            await react(sock, msg, '❌');
            await reply(sock, jid, `❌ *Erro:*\n\`\`\`${err.message}\`\`\``, msg);
        }
        return;
    }

    if (command === 'broadcast' || command === 'anuncio') {
        if (!isOwner) { await reply(sock, jid, '❌ Apenas o dono pode usar este comando!', msg); return; }
        const text = args.join(' ');
        if (!text) { await reply(sock, jid, `❌ Use: *${prefixo}broadcast <mensagem>*`, msg); return; }

        await react(sock, msg, '📢');
        await reply(sock, jid, `📢 Broadcast enviado: "${text}"`, msg);
        return;
    }

    // ══════════════════════════════════════
    // Comando não encontrado
    // ══════════════════════════════════════
    // (Silencioso — não responde para não poluir o chat)
}
