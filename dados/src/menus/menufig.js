export default async function menufig(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝙁𝙄𝙂𝙐𝙍𝙄𝙉𝙃𝘼𝙎
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘾𝙍𝙄𝘼𝙍* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}sticker
${middleBorder}${menuItemIcon}${prefix}sticker2
${middleBorder}${menuItemIcon}${prefix}sbg
${middleBorder}${menuItemIcon}${prefix}sfundo
${middleBorder}${menuItemIcon}${prefix}emojimix
${middleBorder}${menuItemIcon}${prefix}ttp
${middleBorder}${menuItemIcon}${prefix}attp
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙀𝘿𝙄𝙏𝘼𝙍* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}rename
${middleBorder}${menuItemIcon}${prefix}rgtake
${middleBorder}${menuItemIcon}${prefix}take
${middleBorder}${menuItemIcon}${prefix}toimg
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙀𝙓𝙏𝙍𝘼𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}qc
${middleBorder}${menuItemIcon}${prefix}figualeatoria
${middleBorder}${menuItemIcon}${prefix}figurinhas
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Crie figurinhas dignas do submundo.
${bottomBorder}`;
}
