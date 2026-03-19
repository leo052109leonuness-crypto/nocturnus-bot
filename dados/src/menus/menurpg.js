export default async function menurpg(prefix, botName = "NOCTURNUS", userName = "Usuário", {
    header = `╔═══━━━─── • ───━━━═══╗\n🌙 *𝙉𝙊𝘾𝙏𝙐𝙍𝙉𝙐𝙎*\n╚═══━━━─── • ───━━━═══╝\n┊✦ Olá, *#user#*... seja bem-vindo ao submundo.`,
    menuTopBorder = "╭─────── ❖ ───────╮",
    bottomBorder = "╰─────── ❖ ───────╯",
    menuTitleIcon = "❖",
    menuItemIcon = "🌑 › ",
    separatorIcon = "•",
    middleBorder = "┊"
} = {}) {
    const formattedHeader = header.replace(/#user#/g, userName);
    return `${formattedHeader}
${menuTopBorder}
${middleBorder}  𝙍𝙋𝙂 & 𝙀𝘾𝙊𝙉𝙊𝙈𝙄𝘼
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙋𝙀𝙍𝙁𝙄𝙇* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}perfilrpg
${middleBorder}${menuItemIcon}${prefix}carteira
${middleBorder}${menuItemIcon}${prefix}inv
${middleBorder}${menuItemIcon}${prefix}equipamentos
${middleBorder}${menuItemIcon}${prefix}conquistas
${middleBorder}${menuItemIcon}${prefix}evoluir
${middleBorder}${menuItemIcon}${prefix}prestige
${middleBorder}${menuItemIcon}${prefix}streak
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙍𝘼𝙉𝙆𝙄𝙉𝙂* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}toprpg
${middleBorder}${menuItemIcon}${prefix}rankglobal
${middleBorder}${menuItemIcon}${prefix}ranklvl
${middleBorder}${menuItemIcon}${prefix}topriqueza
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙀𝘾𝙊𝙉𝙊𝙈𝙄𝘼* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}dep
${middleBorder}${menuItemIcon}${prefix}sacar
${middleBorder}${menuItemIcon}${prefix}pix
${middleBorder}${menuItemIcon}${prefix}loja
${middleBorder}${menuItemIcon}${prefix}comprar
${middleBorder}${menuItemIcon}${prefix}vender
${middleBorder}${menuItemIcon}${prefix}investir
${middleBorder}${menuItemIcon}${prefix}sell
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙏𝙍𝘼𝘽𝘼𝙇𝙃𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}vagas
${middleBorder}${menuItemIcon}${prefix}emprego
${middleBorder}${menuItemIcon}${prefix}demitir
${middleBorder}${menuItemIcon}${prefix}habilidades
${middleBorder}${menuItemIcon}${prefix}desafiosemanal
${middleBorder}${menuItemIcon}${prefix}desafiomensal
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙅𝙊𝙂𝙊𝙎 𝘿𝙀 𝘼𝙋𝙊𝙎𝙏𝘼* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}dados
${middleBorder}${menuItemIcon}${prefix}coinflip
${middleBorder}${menuItemIcon}${prefix}crash
${middleBorder}${menuItemIcon}${prefix}slots
${middleBorder}${menuItemIcon}${prefix}apostar
${middleBorder}${menuItemIcon}${prefix}roleta
${middleBorder}${menuItemIcon}${prefix}blackjack
${middleBorder}${menuItemIcon}${prefix}loteria
${middleBorder}${menuItemIcon}${prefix}corrida
${middleBorder}${menuItemIcon}${prefix}leilao
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Construa seu império no submundo.
${bottomBorder}`;
}
