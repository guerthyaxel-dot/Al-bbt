import { execSync } from 'child_process'
import fs from 'fs'

export default {

  command: [
    'spotify',
    'sp',
    'spot',
    'music'
  ],

  category: 'downloader',

  run: async (
    sock,
    m,
    args
  ) => {

    if (!args.length) {

      return m.reply(

`✿ Ingresa una canción

Ejemplos:
.sp doma
.sp bad bunny
.sp after dark`
      )
    }

    const query =
      args.join(' ')

    try {

      // =========================
      // REACT
      // =========================

      await sock.sendMessage(
        m.chat,
        {
          react: {
            text: '🎵',
            key: m.key
          }
        }
      )

      // =========================
      // WAIT
      // =========================

      await m.reply(
        '✿ Buscando canción...'
      )

      // =========================
      // CREAR TMP
      // =========================

      if (!fs.existsSync('./tmp')) {

        fs.mkdirSync('./tmp')
      }

      const file =
`./tmp/${Date.now()}.mp3`

      // =========================
      // DESCARGAR
      // =========================

      execSync(

`yt-dlp "ytsearch1:${query}" -x --audio-format mp3 -o "${file}"`,
        {
          stdio: 'ignore'
        }
      )

      // =========================
      // VALIDAR
      // =========================

      if (!fs.existsSync(file)) {

        throw new Error(
          'No se descargó el audio'
        )
      }

      // =========================
      // ENVIAR
      // =========================

      await sock.sendMessage(
        m.chat,
        {

          audio:
            fs.readFileSync(file),

          mimetype:
            'audio/mpeg',

          fileName:
            `${query}.mp3`,

          ptt: false
        },
        {
          quoted: m
        }
      )

      // =========================
      // BORRAR
      // =========================

      fs.unlinkSync(file)

    } catch (e) {

      console.log(e)

      await m.reply(

`❌ Error Spotify

${e.message}`
      )
    }
  },
}
