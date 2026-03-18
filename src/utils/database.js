/**
 * 🌙 NOCTURNUS - Banco de Dados SQLite
 */

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'nocturnus.db');

let db = null;

export async function initDB() {
    if (db) return db;

    // Criar diretório se não existir
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }

    db = await open({ filename: DB_PATH, driver: sqlite3.Database });

    // Criar tabelas
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            jid TEXT PRIMARY KEY,
            name TEXT DEFAULT 'Usuário',
            xp INTEGER DEFAULT 0,
            coins INTEGER DEFAULT 0,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );

        CREATE TABLE IF NOT EXISTS cooldowns (
            key TEXT PRIMARY KEY,
            expires_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS warnings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_jid TEXT NOT NULL,
            group_jid TEXT NOT NULL,
            count INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS group_settings (
            jid TEXT PRIMARY KEY,
            prefix TEXT DEFAULT '!',
            welcome INTEGER DEFAULT 0,
            antilink INTEGER DEFAULT 0
        );
    `);

    // Limpar cooldowns expirados periodicamente
    setInterval(async () => {
        try {
            await db.run('DELETE FROM cooldowns WHERE expires_at < ?', [Date.now()]);
        } catch { }
    }, 60 * 1000);

    console.log('[DB] ✅ Banco de dados inicializado');
    return db;
}

// ─── USUÁRIOS ─────────────────────────────────────────────────────────────

export async function getUser(jid) {
    if (!db) await initDB();
    return db.get('SELECT * FROM users WHERE jid = ?', [jid]);
}

export async function createUser(jid, name = 'Usuário') {
    if (!db) await initDB();
    await db.run(
        'INSERT OR IGNORE INTO users (jid, name, xp, coins) VALUES (?, ?, 0, 0)',
        [jid, name]
    );
}

export async function addXP(jid, amount) {
    if (!db) await initDB();
    await db.run('UPDATE users SET xp = xp + ? WHERE jid = ?', [amount, jid]);
}

export async function addCoins(jid, amount) {
    if (!db) await initDB();
    await db.run('UPDATE users SET coins = coins + ? WHERE jid = ?', [amount, jid]);
}

export async function removeCoins(jid, amount) {
    if (!db) await initDB();
    await db.run('UPDATE users SET coins = MAX(0, coins - ?) WHERE jid = ?', [amount, jid]);
}

export async function getRanking(type = 'xp', limit = 10) {
    if (!db) await initDB();
    const col = type === 'coins' ? 'coins' : 'xp';
    return db.all(`SELECT * FROM users ORDER BY ${col} DESC LIMIT ?`, [limit]);
}

// ─── COOLDOWNS ────────────────────────────────────────────────────────────

export async function getCooldown(key) {
    if (!db) await initDB();
    const row = await db.get('SELECT expires_at FROM cooldowns WHERE key = ?', [key]);
    if (!row) return null;
    if (row.expires_at <= Date.now()) {
        await db.run('DELETE FROM cooldowns WHERE key = ?', [key]);
        return null;
    }
    return row.expires_at;
}

export async function setCooldown(key, durationMs) {
    if (!db) await initDB();
    const expiresAt = Date.now() + durationMs;
    await db.run(
        'INSERT OR REPLACE INTO cooldowns (key, expires_at) VALUES (?, ?)',
        [key, expiresAt]
    );
}

// ─── ADVERTÊNCIAS ─────────────────────────────────────────────────────────

export async function getWarnings(userJid, groupJid) {
    if (!db) await initDB();
    const row = await db.get(
        'SELECT count FROM warnings WHERE user_jid = ? AND group_jid = ?',
        [userJid, groupJid]
    );
    return row ? row.count : 0;
}

export async function addWarning(userJid, groupJid) {
    if (!db) await initDB();
    await db.run(
        `INSERT INTO warnings (user_jid, group_jid, count) VALUES (?, ?, 1)
         ON CONFLICT(user_jid) DO UPDATE SET count = count + 1`,
        [userJid, groupJid]
    );
    // Workaround para ON CONFLICT com múltiplas colunas
    const existing = await db.get(
        'SELECT * FROM warnings WHERE user_jid = ? AND group_jid = ?',
        [userJid, groupJid]
    );
    if (!existing) {
        await db.run(
            'INSERT INTO warnings (user_jid, group_jid, count) VALUES (?, ?, 1)',
            [userJid, groupJid]
        );
    } else {
        await db.run(
            'UPDATE warnings SET count = count + 1 WHERE user_jid = ? AND group_jid = ?',
            [userJid, groupJid]
        );
    }
    return getWarnings(userJid, groupJid);
}

export async function resetWarnings(userJid, groupJid) {
    if (!db) await initDB();
    await db.run(
        'DELETE FROM warnings WHERE user_jid = ? AND group_jid = ?',
        [userJid, groupJid]
    );
}

// ─── CONFIGURAÇÕES DE GRUPO ───────────────────────────────────────────────

export async function getGroupSettings(jid) {
    if (!db) await initDB();
    let row = await db.get('SELECT * FROM group_settings WHERE jid = ?', [jid]);
    if (!row) {
        await db.run('INSERT OR IGNORE INTO group_settings (jid) VALUES (?)', [jid]);
        row = await db.get('SELECT * FROM group_settings WHERE jid = ?', [jid]);
    }
    return row;
}

export async function setGroupSettings(jid, key, value) {
    if (!db) await initDB();
    await db.run(`UPDATE group_settings SET ${key} = ? WHERE jid = ?`, [value, jid]);
}
