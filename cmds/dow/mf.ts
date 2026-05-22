import fetch from 'node-fetch'

export default {
  command: ['mediafire', 'mf'],
  category: 'downloader',

  run: async (sock, m, args) => {

    if (!args.length) {
      return m.reply(
        '✿ Usa:\n+mf https://www.mediafire.com/file/...'
      )
    }

    const url = args[0]

    if (!url.includes('mediafire.com')) {
      return m.reply('✿ Link inválido.')
    }

    try {

      const start = Date.now()

      await m.reply(
        '╭─❍ MediaFire Engine\n' +
        '│ ✦ Obteniendo archivo...\n' +
        '╰──────────────'
      )

      // Obtener html
      const res = await fetch(url)

      const html = await res.text()

      // Sacar link directo
      const dlMatch = html.match(
        /https:\/\/download\d+\.mediafire\.com\/[^"]+/i
      )

      if (!dlMatch) {
        return m.reply(
          '✿ No pude obtener el archivo.'
        )
      }

      const dl = dlMatch[0]

      // Nombre
      const nameMatch = html.match(
        /<div class="filename">(.+?)<\/div>/i
      )

      const fileName = nameMatch
        ? nameMatch[1]
        : 'file'

      // Tamaño
      const sizeMatch = html.match(
        /<span class="details-normal">(.+?)<\/span>/i
      )

      const size = sizeMatch
        ? sizeMatch[1]
        : 'Desconocido'

      const speed =
        ((Date.now() - start) / 1000).toFixed(1)

      const caption =
        `╭─❍ MediaFire Engine\n` +
        `│ ✦ File: ${fileName}\n` +
        `│ ✦ Size: ${size}\n` +
        `│ ✦ Speed: ${speed}s\n` +
        `╰──────────────`

      // Enviar archivo
      await sock.sendMessage(
        m.chat,
        {
          document: { url: dl },
          fileName,
          mimetype: 'application/octet-stream',
          caption
        },
        { quoted: m }
      )

    } catch (e) {

      console.log(e)

      return m.reply(
        '✿ Error al descargar el archivo.'
      )
    }
  }
}
