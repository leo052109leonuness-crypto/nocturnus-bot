export default async function menudono(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝘾𝙊𝙉𝙏𝙍𝙊𝙇𝙀 𝘿𝙊 𝘿𝙊𝙉𝙊
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘾𝙊𝙉𝙁𝙄𝙂𝙐𝙍𝘼𝙍* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}prefixo
${middleBorder}${menuItemIcon}${prefix}numerodono
${middleBorder}${menuItemIcon}${prefix}nomedono
${middleBorder}${menuItemIcon}${prefix}nomebot
${middleBorder}${menuItemIcon}${prefix}fotobot
${middleBorder}${menuItemIcon}${prefix}fotomenu
${middleBorder}${menuItemIcon}${prefix}videomenu
${middleBorder}${menuItemIcon}${prefix}audiomenu
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘿𝙀𝙎𝙄𝙂𝙉* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}designmenu
${middleBorder}${menuItemIcon}${prefix}setborda
${middleBorder}${menuItemIcon}${prefix}setbordafim
${middleBorder}${menuItemIcon}${prefix}setbordameio
${middleBorder}${menuItemIcon}${prefix}setitem
${middleBorder}${menuItemIcon}${prefix}setseparador
${middleBorder}${menuItemIcon}${prefix}settitulo
${middleBorder}${menuItemIcon}${prefix}setheader
${middleBorder}${menuItemIcon}${prefix}resetdesign
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘼𝙐𝙏𝙊-𝙍𝙀𝙎𝙋𝙊𝙎𝙏𝘼𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}addauto
${middleBorder}${menuItemIcon}${prefix}addautomidia
${middleBorder}${menuItemIcon}${prefix}listauto
${middleBorder}${menuItemIcon}${prefix}delauto
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘼𝙇𝙄𝘼𝙎𝙀𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}addalias
${middleBorder}${menuItemIcon}${prefix}listalias
${middleBorder}${menuItemIcon}${prefix}delalias
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘾𝙊𝙈𝘼𝙉𝘿𝙊𝙎 𝘾𝙐𝙎𝙏𝙊𝙈* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}addcmd
${middleBorder}${menuItemIcon}${prefix}addcmdmidia
${middleBorder}${menuItemIcon}${prefix}listcmd
${middleBorder}${menuItemIcon}${prefix}delcmd
${middleBorder}${menuItemIcon}${prefix}testcmd
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙍𝙀𝘼𝙂𝙀𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}addreact
${middleBorder}${menuItemIcon}${prefix}listreact
${middleBorder}${menuItemIcon}${prefix}delreact
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙎𝙀𝙈 𝙋𝙍𝙀𝙁𝙄𝙓𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}addnopref
${middleBorder}${menuItemIcon}${prefix}listnopref
${middleBorder}${menuItemIcon}${prefix}delnopref
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ O poder está em suas mãos, dono.
${bottomBorder}`;
}
