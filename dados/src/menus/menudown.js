export default async function menudown(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙎
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙋𝙀𝙎𝙌𝙐𝙄𝙎𝘼* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}google
${middleBorder}${menuItemIcon}${prefix}noticias
${middleBorder}${menuItemIcon}${prefix}apps
${middleBorder}${menuItemIcon}${prefix}dicionario
${middleBorder}${menuItemIcon}${prefix}wikipedia
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙈𝙐́𝙎𝙄𝘾𝘼* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}letra
${middleBorder}${menuItemIcon}${prefix}play
${middleBorder}${menuItemIcon}${prefix}play2
${middleBorder}${menuItemIcon}${prefix}spotify
${middleBorder}${menuItemIcon}${prefix}soundcloud
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙑𝙄́𝘿𝙀𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}playvid
${middleBorder}${menuItemIcon}${prefix}tiktok
${middleBorder}${menuItemIcon}${prefix}instagram
${middleBorder}${menuItemIcon}${prefix}kwai
${middleBorder}${menuItemIcon}${prefix}igstory
${middleBorder}${menuItemIcon}${prefix}facebook
${middleBorder}${menuItemIcon}${prefix}twitter
${middleBorder}${menuItemIcon}${prefix}pinterest
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘼𝙍𝙌𝙐𝙄𝙑𝙊𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}gdrive
${middleBorder}${menuItemIcon}${prefix}mediafire
${middleBorder}${menuItemIcon}${prefix}mcplugin
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Baixe o que o submundo oferece.
${bottomBorder}`;
}
