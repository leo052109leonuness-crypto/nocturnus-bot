async function menuSticker(prefix, botName = "NOCTURNUS", userName = "Usuário", {
    header = `╔═══━━━─── • ───━━━═══╗\n🌙 *𝙉𝙊𝘾𝙏𝙐𝙍𝙉𝙐𝙎*\n╚═══━━━─── • ───━━━═══╝\n┊✦ Olá, *#user#*... seja bem-vindo ao submundo.`,
    menuTopBorder = "╭─────── ❖ ───────╮",
    bottomBorder = "╰─────── ❖ ───────╯",
    menuTitleIcon = "🌙",
    menuItemIcon = "🌑 › ",
    separatorIcon = "❖",
    middleBorder = "┊",
    createStickerMenuTitle = "🎨 CRIAÇÃO DE FIGURINHAS",
    managementMenuTitle = "⚙️ GERENCIAMENTO DE FIGURINHAS"
} = {}) {
    const formattedHeader = header.replace(/#user#/g, userName);
    return `${formattedHeader}

${menuTopBorder}${separatorIcon} *${createStickerMenuTitle}*
${middleBorder}
${middleBorder}${menuItemIcon}${prefix}emojimix
${middleBorder}${menuItemIcon}${prefix}ttp
${middleBorder}${menuItemIcon}${prefix}attp
${middleBorder}${menuItemIcon}${prefix}sticker
${middleBorder}${menuItemIcon}${prefix}sticker2
${middleBorder}${menuItemIcon}${prefix}sbg
${middleBorder}${menuItemIcon}${prefix}sfundo
${middleBorder}${menuItemIcon}${prefix}qc
${bottomBorder}

${menuTopBorder}${separatorIcon} *${managementMenuTitle}*
${middleBorder}
${middleBorder}${menuItemIcon}${prefix}figualeatoria
${middleBorder}${menuItemIcon}${prefix}figurinhas
${middleBorder}${menuItemIcon}${prefix}rename
${middleBorder}${menuItemIcon}${prefix}rgtake
${middleBorder}${menuItemIcon}${prefix}take
${middleBorder}${menuItemIcon}${prefix}toimg
${bottomBorder}
`;
}
export default menuSticker;