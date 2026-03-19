export default async function menumemb(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝙈𝙀𝙈𝘽𝙍𝙊𝙎
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙋𝙀𝙍𝙁𝙄𝙇* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}perfil
${middleBorder}${menuItemIcon}${prefix}meustatus
${middleBorder}${menuItemIcon}${prefix}conquistas
${middleBorder}${menuItemIcon}${prefix}inv
${middleBorder}${menuItemIcon}${prefix}rep
${middleBorder}${menuItemIcon}${prefix}toprep
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙂𝙍𝙐𝙋𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}ping
${middleBorder}${menuItemIcon}${prefix}statusbot
${middleBorder}${menuItemIcon}${prefix}statusgp
${middleBorder}${menuItemIcon}${prefix}regras
${middleBorder}${menuItemIcon}${prefix}mention
${middleBorder}${menuItemIcon}${prefix}afk
${middleBorder}${menuItemIcon}${prefix}voltei
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘼𝙏𝙄𝙑𝙄𝘿𝘼𝘿𝙀* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}rankativo
${middleBorder}${menuItemIcon}${prefix}rankinativo
${middleBorder}${menuItemIcon}${prefix}rankativos
${middleBorder}${menuItemIcon}${prefix}atividade
${middleBorder}${menuItemIcon}${prefix}checkativo
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙀𝙎𝙏𝘼𝙏𝙄𝙎𝙏𝙄𝘾𝘼𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}totalcmd
${middleBorder}${menuItemIcon}${prefix}topcmd
${middleBorder}${menuItemIcon}${prefix}caixa
${middleBorder}${menuItemIcon}${prefix}presente
${middleBorder}${menuItemIcon}${prefix}denunciar
${middleBorder}${menuItemIcon}${prefix}denuncias
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙁𝙍𝙀𝙀 𝙁𝙄𝙍𝙀* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}likeff
${middleBorder}${menuItemIcon}${prefix}infoff
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Conheça os habitantes do submundo.
${bottomBorder}`;
}
