import { resolveLidToRealJid } from "../../core/utils.ts"

export default {
  command: ['addcoins', 'darcoins'],
  category: 'owner',
  owner: true,

  run: async (sock, m, args) => {
    try {
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
      const botSettings = await getSettings(botId)
      const monedas = botSettings.currency || 'coins'

      const mentioned = m.mentionedJid || []
      const who2 = mentioned[0] || args.find(arg => arg.includes('@s.whatsapp.net'))
      const who = await resolveLidToRealJid(who2, sock, m.chat)

      if (!who2)
        return m.reply(`✦ Debes mencionar a un usuario.`)

      const cantidad = parseInt(args[0])

      if (isNaN(cantidad) || cantidad <= 0)
        return m.reply(`✦ Ingresa una cantidad válida.`)

      const targetData = await getChatUser(m.chat, who)

      if (!targetData)
        return m.reply(`✦ El usuario no está registrado.`)

      targetData.coins += cantidad

      await updateChatUser(m.chat, who, 'coins', targetData.coins)

      await sock.reply(
        m.chat,
        `✦ Se añadieron *${cantidad.toLocaleString()} ${monedas}* a *@${who.split('@')[0]}*.`,
        m,
        { mentions: [who] }
      )

    } catch (e) {
      await m.reply(msgglobal + e)
    }
  }
}

