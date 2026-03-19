export default async function ferramentas(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝙁𝙀𝙍𝙍𝘼𝙈𝙀𝙉𝙏𝘼𝙎
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙐𝙏𝙄𝙇𝙄𝘿𝘼𝘿𝙀𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}gerarnick
${middleBorder}${menuItemIcon}${prefix}ssweb
${middleBorder}${menuItemIcon}${prefix}qrcode <texto>
${middleBorder}${menuItemIcon}${prefix}lerqr
${middleBorder}${menuItemIcon}${prefix}calc <expressão>
${middleBorder}${menuItemIcon}${prefix}encurtalink
${middleBorder}${menuItemIcon}${prefix}upload
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾̧𝘼̃𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}horoscopo <signo>
${middleBorder}${menuItemIcon}${prefix}signos
${middleBorder}${menuItemIcon}${prefix}hora <cidade>
${middleBorder}${menuItemIcon}${prefix}clima <cidade>
${middleBorder}${menuItemIcon}${prefix}dicionario
${middleBorder}${menuItemIcon}${prefix}tradutor
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙉𝙊𝙏𝘼𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}nota add <texto>
${middleBorder}${menuItemIcon}${prefix}notas
${middleBorder}${menuItemIcon}${prefix}nota ver <id>
${middleBorder}${menuItemIcon}${prefix}nota del <id>
${middleBorder}${menuItemIcon}${prefix}nota fixar <id>
${middleBorder}${menuItemIcon}${prefix}nota buscar <termo>
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙇𝙀𝙈𝘽𝙍𝘼𝙉𝘾̧𝘼𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}lembrete
${middleBorder}${menuItemIcon}${prefix}meuslembretes
${middleBorder}${menuItemIcon}${prefix}apagalembrete
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙊𝙐𝙏𝙍𝙊𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}verificar <link>
${middleBorder}${menuItemIcon}${prefix}aniversario
${middleBorder}${menuItemIcon}${prefix}estatisticas
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Ferramentas do submundo ao seu alcance.
${bottomBorder}`;
}
