// © Ado | 2026
// Instagram Downloader
// Compatible con TU base

import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import CryptoJS from 'crypto-js'

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",

  Accept: "*/*",

  "hx-request": "true",

  "hx-current-url":
    "https://reelsvideo.io/",

  "hx-target": "target",

  "Content-Type":
    "application/x-www-form-urlencoded; charset=UTF-8",

  Origin:
    "https://reelsvideo.io",

  Referer:
    "https://reelsvideo.io/"
}

// ===============================
// HELPERS
// ===============================

function generateTS() {

  return Math.floor(
    Date.now() / 1000
  )
}

function generateTT(ts: number) {

  return CryptoJS.MD5(
    ts + "X-Fc-Pp-Ty-eZ"
  ).toString()
}

// ===============================
// DESCARGAR
// ===============================

async function descargarReels(
  videoUrl: string
) {

  try {

    const ts =
      generateTS()

    const tt =
      generateTT(ts)

    const body =
      new URLSearchParams()

    body.append(
      "id",
      videoUrl
    )

    body.append(
      "locale",
      "en"
    )

    body.append(
      "cf-turnstile-response",
      ""
    )

    body.append(
      "tt",
      tt
    )

    body.append(
      "ts",
      String(ts)
    )

    const response =
      await fetch(
        "https://reelsvideo.io/",
        {
          method: "POST",
          headers: HEADERS,
          body: body.toString()
        }
      )

    const html =
      await response.text()

    const $ =
      cheerio.load(html)

    const username =

      $(".bg-white span.text-400-16-18")
        .first()
        .text()
        .trim() ||

      "Instagram"

    const videos: string[] = []

    $("a.type_videos").each(
      (_, el) => {

        const href =
          $(el).attr("href")

        if (href) {

          videos.push(href)
        }
      }
    )

    const images: string[] = []

    $("a.type_images").each(
      (_, el) => {

        const href =
          $(el).attr("href")

        if (href) {

          images.push(href)
        }
      }
    )

    return {
      status: true,
      username,
      videos,
      images
    }

  } catch (e: any) {

    return {
      status: false,
      error: e.message
    }
  }
}

// ===============================
// EXPORT
// ===============================

export default {

  command: [
    'ig',
    'instagram',
    'reel'
  ],

  category: 'downloader',

  run: async (
    sock,
    m,
    args,
    command
  ) => {

    if (!args.length) {

      return m.reply(

`✿ Ingresa un link de Instagram.

Ejemplo:
.ig https://www.instagram.com/reel/xxxxx/`
      )
    }

    const url =
      args[0]

    try {

      const result =
        await descargarReels(
          url
        )

      if (!result.status) {

        return m.reply(
          "❌ " +
          result.error
        )
      }

      const medias = []

      // =====================
      // VIDEOS
      // =====================

      for (
        const vid of result.videos
      ) {

        medias.push({
          type: 'video',
          data: {
            url: vid
          },

          caption:

`📥 Instagram Downloader

👤 Usuario:
${result.username}`
        })
      }

      // =====================
      // IMÁGENES
      // =====================

      for (
        const img of result.images
      ) {

        medias.push({
          type: 'image',
          data: {
            url: img
          },

          caption:

`📥 Instagram Downloader

👤 Usuario:
${result.username}`
        })
      }

      if (!medias.length) {

        return m.reply(
          '❌ No se encontraron archivos'
        )
      }

      if (medias.length === 1) {

        const media =
          medias[0]

        await sock.sendMessage(
          m.chat,
          {
            [media.type]:
              media.data,

            caption:
              media.caption
          },
          {
            quoted: m
          }
        )

      } else {

        await sock.sendAlbumMessage(
          m.chat,
          medias,
          {
            quoted: m
          }
        )
      }

    } catch (e) {

      console.log(e)

      m.reply(
        '❌ Error al descargar'
      )
    }
  },
}
