export default async function menuvip(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝙑𝙄𝙋 & 𝙋𝙍𝙀𝙈𝙄𝙐𝙈
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙑𝙄𝙋* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}addcmdvip
${middleBorder}${menuItemIcon}${prefix}infovip
${middleBorder}${menuItemIcon}${prefix}dono
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Acesso exclusivo ao submundo VIP.
${bottomBorder}`;
}
