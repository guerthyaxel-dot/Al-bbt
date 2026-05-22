// © Ado | 2026
// HD / Enhance Image
// Compatible con TU AlyaBot-MD

import fetch from 'node-fetch'
import FormData from 'form-data'

// ===============================
// API
// ===============================

async function mejorarImagen(buffer) {

  const form =
    new FormData()

  form.append(
    'image',
    buffer,
    'image.jpg'
  )

  const res =
    await fetch(
      'https://api.itsrose.rest/image/upscale',
      {
        method: 'POST',

        headers: {
          Authorization:
            'Bearer YOUR_APIKEY'
        },

        body: form
      }
    )

  if (!res.ok) {

    throw new Error(
      `HTTP ${res.status}`
    )
  }

  const json =
    await res.json()

  if (!json.status) {

    throw new Error(
      'Error al mejorar'
    )
  }

  return json.result.image
}

// ===============================
// EXPORT
// ===============================

export default {

  command: [
    'hd',
    'enhance',
    'upscale'
  ],

  category:
    'tools',

  run: async (
    sock,
    m,
    args,
    command
  ) => {

    try {

      const quoted =
        m.quoted
          ? m.quoted
          : m

      const mime =
        quoted.mimetype || ''

      if (
        !mime.startsWith(
          'image/'
        )
      ) {

        return m.reply(

`✿ Responde a una imagen.

Ejemplo:
.hd`
        )
      }

      // =====================
      // REACT
      // =====================

      await sock.sendMessage(
        m.chat,
        {
          react: {
            text: '✨',
            key: m.key
          }
        }
      )

      // =====================
      // DOWNLOAD
      // =====================

      const buffer =
        await quoted.download()

      // =====================
      // UPSCALE
      // =====================

      const hd =
        await mejorarImagen(
          buffer
        )

      // =====================
      // SEND
      // =====================

      await sock.sendMessage(
        m.chat,
        {
          image: {
            url: hd
          },

          caption:
            '✨ Imagen mejorada en HD'
        },
        {
          quoted: m
        }
      )

    } catch (e) {

      console.log(e)

      m.reply(
        '❌ No se pudo mejorar la imagen'
      )
    }
  },
}
