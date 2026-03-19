export default async function menulogo(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝙇𝙊𝙂𝙊𝙏𝙄𝙋𝙊𝙎
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙀𝙎𝙏𝙄𝙇𝙊𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}darkgreen
${middleBorder}${menuItemIcon}${prefix}glitch
${middleBorder}${menuItemIcon}${prefix}write
${middleBorder}${menuItemIcon}${prefix}advanced
${middleBorder}${menuItemIcon}${prefix}typography
${middleBorder}${menuItemIcon}${prefix}pixel
${middleBorder}${menuItemIcon}${prefix}neon
${middleBorder}${menuItemIcon}${prefix}neon2
${middleBorder}${menuItemIcon}${prefix}flag
${middleBorder}${menuItemIcon}${prefix}americanflag
${middleBorder}${menuItemIcon}${prefix}deleting
${middleBorder}${menuItemIcon}${prefix}pornhub
${middleBorder}${menuItemIcon}${prefix}avengers
${middleBorder}${menuItemIcon}${prefix}graffiti
${middleBorder}${menuItemIcon}${prefix}captainamerica
${middleBorder}${menuItemIcon}${prefix}stone3d
${middleBorder}${menuItemIcon}${prefix}thor
${middleBorder}${menuItemIcon}${prefix}amongus
${middleBorder}${menuItemIcon}${prefix}deadpool
${middleBorder}${menuItemIcon}${prefix}blackpink
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Crie logos com estilo do submundo.
${bottomBorder}`;
}
