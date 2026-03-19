export default async function menuia(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝙄𝙉𝙏𝙀𝙇𝙄𝙂𝙀̂𝙉𝘾𝙄𝘼 𝘼𝙍𝙏𝙄𝙁𝙄𝘾𝙄𝘼𝙇
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙈𝙊𝘿𝙀𝙇𝙊𝙎 𝘿𝙀 𝙄𝘼* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}gemma
${middleBorder}${menuItemIcon}${prefix}gemma2
${middleBorder}${menuItemIcon}${prefix}codegemma
${middleBorder}${menuItemIcon}${prefix}qwen
${middleBorder}${menuItemIcon}${prefix}qwen2
${middleBorder}${menuItemIcon}${prefix}qwen3
${middleBorder}${menuItemIcon}${prefix}llama
${middleBorder}${menuItemIcon}${prefix}llama3
${middleBorder}${menuItemIcon}${prefix}phi
${middleBorder}${menuItemIcon}${prefix}phi3
${middleBorder}${menuItemIcon}${prefix}mistral
${middleBorder}${menuItemIcon}${prefix}falcon
${middleBorder}${menuItemIcon}${prefix}cog
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙁𝙀𝙍𝙍𝘼𝙈𝙀𝙉𝙏𝘼𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}ideias
${middleBorder}${menuItemIcon}${prefix}explicar
${middleBorder}${menuItemIcon}${prefix}resumir
${middleBorder}${menuItemIcon}${prefix}corrigir
${middleBorder}${menuItemIcon}${prefix}resumirurl
${middleBorder}${menuItemIcon}${prefix}resumirchat
${middleBorder}${menuItemIcon}${prefix}recomendar
${middleBorder}${menuItemIcon}${prefix}debater
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘼𝙑𝙀𝙉𝙏𝙐𝙍𝘼* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}aventura
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ A IA do submundo está à sua disposição.
${bottomBorder}`;
}
