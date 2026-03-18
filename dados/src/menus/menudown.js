export default async function menudown(prefix, botName = "NOCTURNUS", userName = "Usuário", {
    header = `╔═══━━━─── • ───━━━═══╗\n🌙 *𝙉𝙊𝘾𝙏𝙐𝙍𝙉𝙐𝙎*\n╚═══━━━─── • ───━━━═══╝\n┊✦ Olá, *#user#*... seja bem-vindo ao submundo.`,
    menuTopBorder = "╭─────── ❖ ───────╮",
    bottomBorder = "╰─────── ❖ ───────╯",
    menuTitleIcon = "🌙",
    menuItemIcon = "🌑 › ",
    separatorIcon = "❖",
    middleBorder = "┊",
    searchMenuTitle = "🔍 PESQUISAS & CONSULTAS",
    audioMenuTitle = "🎵 MÚSICA & ÁUDIO", 
    videoMenuTitle = "🎬 VÍDEOS & STREAMING",
    downloadMenuTitle = "📥 DOWNLOADS",
    mediaMenuTitle = "📱 MÍDIAS SOCIAIS",
    gamesMenuTitle = "🎮 GAMING & APPS"
} = {}) {
    const formattedHeader = header.replace(/#user#/g, userName);
    return `${formattedHeader}

${menuTopBorder}${separatorIcon} *${searchMenuTitle}*
${middleBorder}
${middleBorder}${menuItemIcon}${prefix}google
${middleBorder}${menuItemIcon}${prefix}noticias
${middleBorder}${menuItemIcon}${prefix}apps
${middleBorder}${menuItemIcon}${prefix}dicionario
${middleBorder}${menuItemIcon}${prefix}wikipedia
${bottomBorder}

${menuTopBorder}${separatorIcon} *${audioMenuTitle}*
${middleBorder}
${middleBorder}${menuItemIcon}${prefix}letra
${middleBorder}${menuItemIcon}${prefix}play
${middleBorder}${menuItemIcon}${prefix}play2

${middleBorder}${menuItemIcon}${prefix}spotify
${middleBorder}${menuItemIcon}${prefix}soundcloud
${bottomBorder}

${menuTopBorder}${separatorIcon} *${videoMenuTitle}*
${middleBorder}
${middleBorder}${menuItemIcon}${prefix}playvid
${bottomBorder}

${menuTopBorder}${separatorIcon} *${downloadMenuTitle}*
${middleBorder}
${middleBorder}${menuItemIcon}${prefix}tiktok
${middleBorder}${menuItemIcon}${prefix}instagram
${middleBorder}${menuItemIcon}${prefix}kwai
${middleBorder}${menuItemIcon}${prefix}igstory
${middleBorder}${menuItemIcon}${prefix}facebook
${middleBorder}${menuItemIcon}${prefix}gdrive
${middleBorder}${menuItemIcon}${prefix}mediafire
${middleBorder}${menuItemIcon}${prefix}twitter
${bottomBorder}

${menuTopBorder}${separatorIcon} *${mediaMenuTitle}*
${middleBorder}
${middleBorder}${menuItemIcon}${prefix}pinterest
${bottomBorder}

${menuTopBorder}${separatorIcon} *${gamesMenuTitle}*
${middleBorder}
${middleBorder}${menuItemIcon}${prefix}mcplugin
${bottomBorder}
`;
}