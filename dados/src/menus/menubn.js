export default async function menubn(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝙅𝙊𝙂𝙊𝙎 & 𝘿𝙄𝙑𝙀𝙍𝙎𝘼̃𝙊
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙅𝙊𝙂𝙊𝙎 𝙈𝙐𝙇𝙏𝙄𝙋𝙇𝘼𝙔𝙀𝙍* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}tictactoe
${middleBorder}${menuItemIcon}${prefix}connect4
${middleBorder}${menuItemIcon}${prefix}uno
${middleBorder}${menuItemIcon}${prefix}memoria
${middleBorder}${menuItemIcon}${prefix}batalhanaval
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙅𝙊𝙂𝙊𝙎 𝘿𝙀 𝙋𝘼𝙇𝘼𝙑𝙍𝘼𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}wordle
${middleBorder}${menuItemIcon}${prefix}forca
${middleBorder}${menuItemIcon}${prefix}anagrama
${middleBorder}${menuItemIcon}${prefix}cacapalavras
${middleBorder}${menuItemIcon}${prefix}digitar
${middleBorder}${menuItemIcon}${prefix}stop
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙅𝙊𝙂𝙊𝙎 𝘿𝙀 𝙋𝙀𝙍𝙂𝙐𝙉𝙏𝘼𝙎* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}quiz
${middleBorder}${menuItemIcon}${prefix}dueloquiz
${middleBorder}${menuItemIcon}${prefix}eununca
${middleBorder}${menuItemIcon}${prefix}vab
${middleBorder}${menuItemIcon}${prefix}sn
${middleBorder}${menuItemIcon}${prefix}ppt
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘿𝙄𝙑𝙀𝙍𝙎𝘼̃𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}chance
${middleBorder}${menuItemIcon}${prefix}quando
${middleBorder}${menuItemIcon}${prefix}sorte
${middleBorder}${menuItemIcon}${prefix}casal
${middleBorder}${menuItemIcon}${prefix}shipo
${middleBorder}${menuItemIcon}${prefix}suicidio
${middleBorder}${menuItemIcon}${prefix}conselho
${middleBorder}${menuItemIcon}${prefix}cantada
${middleBorder}${menuItemIcon}${prefix}piada
${middleBorder}${menuItemIcon}${prefix}charada
${middleBorder}${menuItemIcon}${prefix}motivacional
${middleBorder}${menuItemIcon}${prefix}elogio
${middleBorder}${menuItemIcon}${prefix}reflexao
${middleBorder}${menuItemIcon}${prefix}fato
${middleBorder}${menuItemIcon}${prefix}chute
${middleBorder}${menuItemIcon}${prefix}tapa
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Que os jogos comecem...
${bottomBorder}`;
}
