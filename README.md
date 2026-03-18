# 🌙 NOCTURNUS Bot — Seu Assistente Completo para WhatsApp

> Bot avançado e multifuncional para WhatsApp, desenvolvido com **Node.js** e a biblioteca **WaLib (Whaileys)**. Focado em administração de grupos, RPG, economia, IA e entretenimento.

---

## ✨ Características

- **Configuração Simples**: Conecte via QR Code ou código de pareamento
- **Funcionalidade Completa**: Administração, RPG, downloads, IA, jogos e muito mais
- **Multiplataforma**: Windows, Linux, macOS, Termux (Android) e VPS
- **Estável e Seguro**: Baseado no modo multi-dispositivos do WhatsApp
- **Modular**: Estrutura organizada e fácil de expandir

---

## 📋 Pré-requisitos

| Item | Versão |
|------|--------|
| **Node.js** | >= 20.0.0 |
| **npm** | >= 9.0.0 |
| **Git** | Qualquer versão recente |

---

## 🚀 Instalação

### Windows / Linux / macOS

```bash
git clone https://github.com/leo052109leonuness-crypto/nocturnus-bot.git
cd nocturnus-bot
npm install
npm run config
npm start
```

### Termux (Android)

```bash
pkg update && pkg upgrade -y
pkg install nodejs git -y
termux-setup-storage
cd ~/storage/shared
git clone https://github.com/leo052109leonuness-crypto/nocturnus-bot.git
cd nocturnus-bot
npm install
npm run config
npm start
```

---

## ⚙️ Configuração

Execute `npm run config` e preencha:

- 👤 **Nome do dono** — Seu nome
- 📱 **Número do dono** — Seu número com código do país (ex: `5511999999999`)
- 🤖 **Nome do bot** — NOCTURNUS (ou o que preferir)
- 🔣 **Prefixo** — `/` ou `!` (padrão: `/`)

---

## 🔌 Conectando ao WhatsApp

Ao iniciar com `npm start`, escolha:

- **Opção 1** — QR Code (recomendado para internet instável)
- **Opção 2** — Código de pareamento

> ⚠️ **Use sempre um número secundário para o bot!**

---

## 📋 Comandos Disponíveis

Use `/menu` para ver o menu principal. Submenus disponíveis:

| Comando | Descrição |
|---------|-----------|
| `/menu` | Menu principal |
| `/menuadm` | Comandos de administração |
| `/menurpg` | RPG e economia |
| `/menubn` | Jogos e diversão |
| `/menudown` | Downloads |
| `/menuia` | Inteligência Artificial |
| `/menufig` | Figurinhas |
| `/menumemb` | Membros |
| `/ferramentas` | Ferramentas úteis |
| `/menudono` | Comandos do dono |

---

## 🔄 Atualizando

```bash
npm run update
```

---

## 📁 Estrutura do Projeto

```
nocturnus-bot/
├── dados/
│   ├── src/
│   │   ├── .scripts/       # start, config, update
│   │   ├── funcs/
│   │   │   ├── downloads/  # youtube, tiktok, spotify...
│   │   │   ├── json/       # dados dos jogos
│   │   │   ├── private/    # IA, antipalavra, antitoxic
│   │   │   └── utils/      # sticker, emojimix, games...
│   │   ├── menus/          # todos os menus
│   │   ├── utils/          # database, helpers, cache...
│   │   ├── connect.js      # conexão WhatsApp
│   │   └── index.js        # loader de menus
│   ├── database/           # dados salvos
│   └── midias/             # imagens do bot
└── package.json
```

---

*🌙 NOCTURNUS Bot — Feito para comunidades*
