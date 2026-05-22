import yts from 'yt-search'
import { exec } from 'child_process'
import { getBuffer } from '../../core/message.ts'

const msgglobal = '《✧》 Ocurrió un error inesperado.'

export default {
  command: ['play2', 'mp4', 'ytmp4'],
  category: 'downloader',

  run: async (sock, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('《✧》 Escribe el nombre del video.')
      }

      const text = args.join(' ')

      const search = await yts(text)

      const videoInfo = search.videos[0]

      if (!videoInfo) {
        return m.reply('《✧》 No encontré resultados.')
      }

      const url = videoInfo.url
      const title = videoInfo.title

      let thumb = null

      try {
        thumb = await getBuffer(videoInfo.thumbnail)
      } catch {}

      const caption = `
✦ Título: ${title}
✦ Canal: ${videoInfo.author?.name || 'Desconocido'}
✦ Duración: ${videoInfo.timestamp || 'Desconocida'}
✦ Vistas: ${videoInfo.views || 0}

⏳ Descargando video...
`

      if (thumb) {
        await sock.sendMessage(
          m.chat,
          {
            image: thumb,
            caption
          },
          { quoted: m }
        )
      } else {
        await m.reply(caption)
      }

      exec(
        `yt-dlp -f "mp4" -g "${url}"`,
        async (err, stdout) => {
          if (err) {
            console.log(err)
            return m.reply('❌ Error descargando el video.')
          }

          const videoUrl = stdout.trim()

          if (!videoUrl) {
            return m.reply('❌ No pude obtener el video.')
          }

          await sock.sendMessage(
            m.chat,
            {
              video: { url: videoUrl },
              mimetype: 'video/mp4',
              fileName: `${title}.mp4`,
              caption: title
            },
            { quoted: m }
          )
        }
      )
    } catch (e) {
      console.log(e)
      m.reply(msgglobal)
    }
  }
}
