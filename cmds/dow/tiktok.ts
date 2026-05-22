import fetch from 'node-fetch'

const API = "https://www.tikwm.com"
const UA = "Mozilla/5.0"

async function api(endpoint, params) {
  const res = await fetch(`${API}${endpoint}`, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: new URLSearchParams(params).toString(),
  })

  const data = await res.json()

  if (data.code !== 0) {
    throw new Error(data.msg)
  }

  return data.data
}

function isTikTokLink(text) {
  return /tiktok\.com/i.test(text) || /vm\.tiktok/i.test(text)
}

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',

  run: async (sock, m, args) => {

    if (!args.length) {
      return m.reply(`✿ Ingresa un término o enlace de TikTok.`)
    }

    const text = args.join(" ")

    try {

      // DESCARGA POR LINK
      if (isTikTokLink(text)) {

        const raw = await api("/api/", {
          url: text
        })

        const caption =
          `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅓ownload　ׄᰙ\n\n` +
          `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${raw.title || 'Sin título'}\n` +
          `𖣣ֶㅤ֯⌗ ★ ⬭ Autor: ${raw.author?.nickname || raw.author?.unique_id || 'Desconocido'}\n` +
          `𖣣ֶㅤ֯⌗ ❃ ⬭ Duración: ${raw.duration || 'N/A'}\n` +
          `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(raw.digg_count || 0).toLocaleString()}\n` +
          `𖣣ֶㅤ֯⌗ ❖ ⬭ Comentarios: ${(raw.comment_count || 0).toLocaleString()}\n` +
          `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Vistas: ${(raw.play_count || 0).toLocaleString()}\n` +
          `𖣣ֶㅤ֯⌗ ⚡︎ ⬭ Compartidos: ${(raw.share_count || 0).toLocaleString()}\n` +
          `𖣣ֶㅤ֯⌗ ꕥ ⬭ Audio: ${raw.music_info?.title || 'Desconocido'} ${raw.music_info?.author || ''}`

        await sock.sendMessage(
          m.chat,
          {
            video: { url: raw.play },
            caption
          },
          { quoted: m }
        )

      } else {

        // BÚSQUEDA
        const raw = await api("/api/feed/search", {
          keywords: text,
          count: "5",
          cursor: "0"
        })

        const videos = raw.videos || []

        if (!videos.length) {
          return m.reply(`❖ No se encontraron resultados para: ${text}`)
        }

        const medias = []

        for (const v of videos) {

          const caption =
            `ㅤ۟∩　ׅ　★ ໌　ׅ　🅣𝗂𝗄𝖳𝗈𝗄 🅓ownload　ׄᰙ\n\n` +
            `𖣣ֶㅤ֯⌗ ✿ ⬭ Título: ${v.title || 'Sin título'}\n` +
            `𖣣ֶㅤ֯⌗ ❑ ⬭ Autor: ${v.author?.nickname || v.author?.unique_id || 'Desconocido'}\n` +
            `𖣣ֶㅤ֯⌗ ❀ ⬭ Duración: ${v.duration || 'N/A'}\n` +
            `𖣣ֶㅤ֯⌗ ♡ ⬭ Likes: ${(v.digg_count || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ★ ⬭ Comentarios: ${(v.comment_count || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ❖ ⬭ Vistas: ${(v.play_count || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ꕥ ⬭ Compartidos: ${(v.share_count || 0).toLocaleString()}\n` +
            `𖣣ֶㅤ֯⌗ ☄︎ ⬭ Audio: ${v.music_info?.title || 'Desconocido'} ${v.music_info?.author || ''}`

          medias.push({
            type: 'video',
            data: { url: v.play },
            caption
          })
        }

        await sock.sendAlbumMessage(
          m.chat,
          medias,
          { quoted: m }
        )
      }

    } catch (e) {
      console.log(e)
      await m.reply(String(e))
    }
  },
}
