import ytsearch from 'yt-search'
import { getBuffer } from '../../core/message.ts'
import fetch from 'node-fetch'
import { execSync } from 'child_process'
import fs from 'fs'
export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',
  run: async (sock, m, args) => {
    try {
      if (!args[0]) {
        return m.reply('《✧》Por favor, menciona el nombre o URL del video que deseas descargar')
      }

      const text = args.join(' ')
      const searchResult = await ytsearch(text)
      if (!searchResult.videos || !searchResult.videos.length) {
        return m.reply('《✧》 No se encontró información del video.')
      }

     // const randomIndex = Math.floor(Math.random() * searchResult.videos.length)
      const video = searchResult.videos[0]

      const { title, author, timestamp: duration, views, url, image } = video
      const vistas = (views || 0).toLocaleString()
      const canal = author?.name || author || 'Desconocido'
      const thumbBuffer = await getBuffer(image)

      const caption = `➥ Descargando › ${title}

> ✿⃘࣪◌ ֪ Canal › ${canal}
> ✿⃘࣪◌ ֪ Duración › ${duration || 'Desconocido'}
> ✿⃘࣪◌ ֪ Vistas › ${vistas}
> ✿⃘࣪◌ ֪ Enlace › ${url}

𐙚 ❀ ｡ ↻ El archivo se está enviando, espera un momento... ˙𐙚`

      await sock.sendMessage(m.chat, { image: thumbBuffer, caption }, { quoted: m })

const file = `./tmp/${Date.now()}.mp3`

execSync(`yt-dlp -x --audio-format mp3 -o "${file}" "${url}"`)

const audioBuffer = fs.readFileSync(file)

      const mensaje = {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }

      await sock.sendMessage(m.chat, mensaje, { quoted: m })

    fs.unlinkSync(file)

    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}
