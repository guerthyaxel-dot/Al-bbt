// © Ado | 2026
// Facebook Downloader/Search
// Compatible con TU AlyaBot-MD

import fetch from 'node-fetch'

// ===============================
// CONFIG
// ===============================

const cookies = [
  {
    name: "datr",
    value: "TU_DATR"
  },

  {
    name: "sb",
    value: "TU_SB"
  },

  {
    name: "c_user",
    value: "TU_C_USER"
  },

  {
    name: "xs",
    value: "TU_XS"
  }
]

// ===============================
// USER AGENT
// ===============================

const ua =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

// ===============================
// BASE
// ===============================

const base =
  "https://www.facebook.com"

const graphql_url =
  `${base}/api/graphql/`

const search_doc_id =
  "27004494905847061"

// ===============================
// COOKIES
// ===============================

function getCookieString() {

  return cookies
    .map(c =>
      `${c.name}=${c.value}`
    )
    .join("; ")
}

// ===============================
// TOKENS
// ===============================

async function getSessionTokens() {

  const cookieStr =
    getCookieString()

  const res =
    await fetch(base, {

      headers: {

        "User-Agent":
          ua,

        Accept:
          "text/html",

        Cookie:
          cookieStr
      }
    })

  const html =
    await res.text()

  const extract = (p) => {

    const m =
      html.match(p)

    return m
      ? m[1]
      : ""
  }

  const fb_dtsg =

    extract(
      /\["DTSGInitData",\[\],\{"token":"([^"]+)"/
    )

  const lsd =

    extract(
      /\["LSD",\[\],\{"token":"([^"]+)"/
    )

  const userId =

    extract(
      /"USER_ID":"(\d+)"/
    )

  const hsi =

    extract(
      /"hsi":"(\d+)"/
    )

  const rev =

    extract(
      /"server_revision":(\d+)/
    )

  if (
    !fb_dtsg ||
    !userId
  ) {

    throw new Error(
      "Cookies inválidas"
    )
  }

  return {

    fb_dtsg,
    lsd,
    hsi,
    rev,
    userId,
    cookieStr
  }
}

// ===============================
// VARIABLES
// ===============================

function buildVariables(
  query,
  limit
) {

  return {

    allow_streaming: false,

    args: {

      callsite:
        "COMET_GLOBAL_SEARCH",

      text:
        query
    },

    count:
      limit,

    cursor:
      null
  }
}

// ===============================
// BODY
// ===============================

function buildBody(
  tokens,
  variables
) {

  const p =
    new URLSearchParams()

  p.set(
    "av",
    tokens.userId
  )

  p.set(
    "__user",
    tokens.userId
  )

  p.set(
    "__a",
    "1"
  )

  p.set(
    "__req",
    "1"
  )

  p.set(
    "__rev",
    tokens.rev
  )

  p.set(
    "__hsi",
    tokens.hsi
  )

  p.set(
    "fb_dtsg",
    tokens.fb_dtsg
  )

  p.set(
    "lsd",
    tokens.lsd
  )

  p.set(
    "fb_api_caller_class",
    "RelayModern"
  )

  p.set(
    "fb_api_req_friendly_name",
    "SearchCometResultsPaginatedResultsQuery"
  )

  p.set(
    "variables",
    JSON.stringify(
      variables
    )
  )

  p.set(
    "server_timestamps",
    "true"
  )

  p.set(
    "doc_id",
    search_doc_id
  )

  return p.toString()
}

// ===============================
// PARSER
// ===============================

function parseResults(
  text
) {

  const users = []
  const videos = []
  const photos = []

  for (
    const line of text.split(
      "\n"
    )
  ) {

    try {

      const j =
        JSON.parse(line)

      const edges =

        j?.data
          ?.serpResponse
          ?.results
          ?.edges || []

      for (
        const edge of edges
      ) {

        const s =
          JSON.stringify(
            edge
          )

        // =====================
        // USERS
        // =====================

        const userMatch =

          s.match(
            /"name":"([^"]+)"/
          )

        const profileMatch =

          s.match(
            /"profile_url":"([^"]+)"/
          )

        if (
          userMatch &&
          profileMatch
        ) {

          users.push({

            name:
              userMatch[1],

            url:
              profileMatch[1]
                .replace(
                  /\\/g,
                  ''
                )
          })
        }

        // =====================
        // VIDEOS
        // =====================

        const video =

          s.match(
            /"playable_url":"([^"]+)"/
          )

        if (video) {

          videos.push({

            url:
              video[1]
                .replace(
                  /\\/g,
                  ''
                )
          })
        }

        // =====================
        // PHOTOS
        // =====================

        const photo =

          s.match(
            /"image":\{"uri":"([^"]+)"/
          )

        if (photo) {

          photos.push({

            url:
              photo[1]
                .replace(
                  /\\/g,
                  ''
                )
          })
        }
      }

    } catch {}
  }

  return {

    users,
    videos,
    photos
  }
}

// ===============================
// SEARCH
// ===============================

async function buscarFacebook(
  query,
  limit = 10
) {

  const tokens =
    await getSessionTokens()

  const variables =
    buildVariables(
      query,
      limit
    )

  const body =
    buildBody(
      tokens,
      variables
    )

  const res =
    await fetch(
      graphql_url,
      {

        method: "POST",

        headers: {

          "User-Agent":
            ua,

          "Content-Type":
            "application/x-www-form-urlencoded",

          Cookie:
            tokens.cookieStr
        },

        body
      }
    )

  const text =
    await res.text()

  return parseResults(
    text
  )
}

// ===============================
// EXPORT
// ===============================

export default {

  command: [
    'fb',
    'facebook'
  ],

  category:
    'search',

  run: async (
    sock,
    m,
    args,
    command
  ) => {

    if (!args.length) {

      return m.reply(

`✿ Ingresa una búsqueda.

Ejemplo:
.fb gatos
.fb memes`
      )
    }

    const query =
      args.join(" ")

    try {

      const result =

        await buscarFacebook(
          query,
          10
        )

      let txt =

`🔎 Facebook Search

📝 Query:
${query}

👤 Usuarios:
${result.users.length}

🎥 Videos:
${result.videos.length}

🖼 Fotos:
${result.photos.length}
`

      // =====================
      // USERS
      // =====================

      if (
        result.users.length
      ) {

        txt +=
`\n👤 Usuarios:\n`

        for (
          const u of result.users
            .slice(0, 5)
        ) {

          txt +=

`• ${u.name}
${u.url}

`
        }
      }

      await m.reply(txt)

      // =====================
      // VIDEOS
      // =====================

      for (
        const v of result.videos
          .slice(0, 3)
      ) {

        await sock.sendMessage(
          m.chat,
          {
            video: {
              url: v.url
            },

            caption:
              "🎥 Facebook Video"
          },
          {
            quoted: m
          }
        )
      }

      // =====================
      // PHOTOS
      // =====================

      for (
        const p of result.photos
          .slice(0, 3)
      ) {

        await sock.sendMessage(
          m.chat,
          {
            image: {
              url: p.url
            },

            caption:
              "🖼 Facebook Photo"
          },
          {
            quoted: m
          }
        )
      }

    } catch (e) {

      console.log(e)

      m.reply(
        '❌ Error en Facebook Search'
      )
    }
  },
}
