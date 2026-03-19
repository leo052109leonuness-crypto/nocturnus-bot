export default async function menuadm(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝘼𝘿𝙈𝙄𝙉𝙄𝙎𝙏𝙍𝘼𝘾̧𝘼̃𝙊
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙈𝙀𝙈𝘽𝙍𝙊𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}ban
${middleBorder}${menuItemIcon}${prefix}ban2
${middleBorder}${menuItemIcon}${prefix}bam
${middleBorder}${menuItemIcon}${prefix}setbammsg
${middleBorder}${menuItemIcon}${prefix}promover
${middleBorder}${menuItemIcon}${prefix}rebaixar
${middleBorder}${menuItemIcon}${prefix}mute
${middleBorder}${menuItemIcon}${prefix}desmute
${middleBorder}${menuItemIcon}${prefix}adv
${middleBorder}${menuItemIcon}${prefix}rmadv
${middleBorder}${menuItemIcon}${prefix}listadv
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙂𝙍𝙐𝙋𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}nomegp
${middleBorder}${menuItemIcon}${prefix}descgrupo
${middleBorder}${menuItemIcon}${prefix}fotogrupo
${middleBorder}${menuItemIcon}${prefix}linkgp
${middleBorder}${menuItemIcon}${prefix}limpar
${middleBorder}${menuItemIcon}${prefix}del
${middleBorder}${menuItemIcon}${prefix}marcar
${middleBorder}${menuItemIcon}${prefix}hidetag
${middleBorder}${menuItemIcon}${prefix}sorteio
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙋𝙍𝙊𝙏𝙀𝘾̧𝘼̃𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}blockuser
${middleBorder}${menuItemIcon}${prefix}unblockuser
${middleBorder}${menuItemIcon}${prefix}listblocksgp
${middleBorder}${menuItemIcon}${prefix}addblacklist
${middleBorder}${menuItemIcon}${prefix}delblacklist
${middleBorder}${menuItemIcon}${prefix}listblacklist
${middleBorder}${menuItemIcon}${prefix}blockcmd
${middleBorder}${menuItemIcon}${prefix}unblockcmd
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙍𝙀𝙂𝙍𝘼𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}addregra
${middleBorder}${menuItemIcon}${prefix}delregra
${middleBorder}${menuItemIcon}${prefix}regras
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘼𝙏𝙄𝙑𝙄𝘿𝘼𝘿𝙀* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}atividade
${middleBorder}${menuItemIcon}${prefix}checkativo
${middleBorder}${menuItemIcon}${prefix}limparrank
${middleBorder}${menuItemIcon}${prefix}resetrank
${middleBorder}${menuItemIcon}${prefix}rankativo
${middleBorder}${menuItemIcon}${prefix}rankinativo
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Apenas admins podem usar estes comandos.
${bottomBorder}`;
}
