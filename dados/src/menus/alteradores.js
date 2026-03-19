export default async function alteradores(prefix, botName = "NOCTURNUS", userName = "Usuário", {
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
${middleBorder}  𝘼𝙇𝙏𝙀𝙍𝘼𝘿𝙊𝙍𝙀𝙎
${bottomBorder}
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝙑𝙄́𝘿𝙀𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}cortarvideo <inicio> <fim>
${middleBorder}${menuItemIcon}${prefix}tomp3
${middleBorder}${menuItemIcon}${prefix}videorapido
${middleBorder}${menuItemIcon}${prefix}videoslow
${middleBorder}${menuItemIcon}${prefix}videoreverso
${middleBorder}${menuItemIcon}${prefix}videoloop
${middleBorder}${menuItemIcon}${prefix}videomudo
${middleBorder}${menuItemIcon}${prefix}videobw
${middleBorder}${menuItemIcon}${prefix}pretoebranco
${middleBorder}${menuItemIcon}${prefix}sepia
${middleBorder}${menuItemIcon}${prefix}espelhar
${middleBorder}${menuItemIcon}${prefix}rotacionar
${middleBorder}${menuItemIcon}${prefix}rmbg
${middleBorder}${menuItemIcon}${prefix}upscale
${middleBorder}
${middleBorder} ${menuTitleIcon} *𝘼𝙐́𝘿𝙄𝙊* ${menuTitleIcon}
${middleBorder}${menuItemIcon}${prefix}cortaraudio <inicio> <fim>
${middleBorder}${menuItemIcon}${prefix}velocidade <0.5-3.0>
${middleBorder}${menuItemIcon}${prefix}normalizar
${middleBorder}${menuItemIcon}${prefix}boyvoice
${middleBorder}${menuItemIcon}${prefix}womenvoice
${middleBorder}${menuItemIcon}${prefix}manvoice
${middleBorder}${menuItemIcon}${prefix}childvoice
${middleBorder}${menuItemIcon}${prefix}speedup
${middleBorder}${menuItemIcon}${prefix}bass
${middleBorder}${menuItemIcon}${prefix}bass2
${middleBorder}${menuItemIcon}${prefix}bass3
${middleBorder}${menuItemIcon}${prefix}bassbn <1-20>
${middleBorder}${menuItemIcon}${prefix}grave
${middleBorder}
${menuTopBorder}
${middleBorder} ✦ Transforme mídias no estilo do submundo.
${bottomBorder}`;
}
