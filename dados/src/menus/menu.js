export default async function menu(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝙈𝙀𝙉𝙐 𝙋𝙍𝙄𝙉𝘾𝙄𝙋𝘼𝙇
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙉𝘼𝙑𝙀𝙂𝘼𝙍* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}menuia
${middleBorder}${menuItemIcon}${prefix}menudown
${middleBorder}${menuItemIcon}${prefix}menulogos
${middleBorder}${menuItemIcon}${prefix}menuadm
${middleBorder}${menuItemIcon}${prefix}menubn
${middleBorder}${menuItemIcon}${prefix}menudono
${middleBorder}${menuItemIcon}${prefix}menumemb
${middleBorder}${menuItemIcon}${prefix}ferramentas
${middleBorder}${menuItemIcon}${prefix}menufig
${middleBorder}${menuItemIcon}${prefix}alteradores
${middleBorder}${menuItemIcon}${prefix}menurpg
${middleBorder}${menuItemIcon}${prefix}menuvip
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Escolha seu destino com sabedoria...
${bottomBorder}`;
}
