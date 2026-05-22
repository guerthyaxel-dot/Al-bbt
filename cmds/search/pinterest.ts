// © Ado | 2026
// Pinterest Search FIXED FINAL
// Compatible con AlyaBot-MD

import axios from 'axios'

// ===============================
// COOKIES
// ===============================

const COOKIE = "_auth=0; _pinterest_sess=TU_COOKIE; csrftoken=TU_CSRF"

// ===============================
// CLASS
// ===============================

class Pinterest {

  constructor() {

    this.origin =
      'https://www.pinterest.com'

    this.endpoint =
`${this.origin}/resource/BaseSearchResource/get/`
  }

  // =============================
  // SEARCH
  // =============================

  async search(
    query,
    limit = 10
  ) {

    try {

      if (!query) {

        throw new Error(
          'Falta query'
        )
      }

      const maxPages = 2
      const pageSize = 25

      let bookmark = null
      let page = 0

      let pins = []

      while (
        page < maxPages &&
        pins.length < limit
      ) {

        const current =
          await this.fetchPage({

            query,

            scope:
              'pins',

            bookmark,

            pageSize,
          })

        pins.push(

          ...current.results.filter(
            x =>
              x?.type === 'pin'
          )
        )

        if (
          !current.bookmark
        ) break

        bookmark =
          current.bookmark

        page++
      }

      const results =

        this.uniqueBy(

          pins
            .map(pin =>
              this.formatPin(pin)
            )

            .filter(
              item =>
                item.descarga
            ),

          item =>
            item.url
        )

        .slice(
          0,
          limit
        )

      return {

        status: true,

        query,

        total:
          results.length,

        data:
          results
      }

    } catch (e) {

      return {

        status: false,

        msg:
          e.message
      }
    }
  }

  // =============================
  // FETCH
  // =============================

  async fetchPage({

    query,

    scope,

    bookmark = null,

    pageSize = 25

  }) {

    const rs = 'typed'

    const sourceUrl =

`/search/${scope}/?q=${encodeURIComponent(query)}&rs=${encodeURIComponent(rs)}`

    const data = {

      options: {

        query,

        scope,

        rs,

        redux_normalize_feed: true,

        source_url:
          sourceUrl,

        static_feed: false,

        page_size:
          pageSize,

        ...(bookmark
          ? {
              bookmarks: [
                bookmark
              ]
            }
          : {}),
      },

      context: {},
    }

    const response =
      await axios.get(
        this.endpoint,
        {

          params: {

            source_url:
              sourceUrl,

            data:
              JSON.stringify(
                data
              ),

            _:
              Date.now(),
          },

          headers:
            this.headers(
              sourceUrl
            ),

          timeout:
            20000,
        }
      )

    const rr =
      response.data
        ?.resource_response

    if (
      response.status !== 200 ||
      !rr
    ) {

      throw new Error(
`HTTP ${response.status}`
      )
    }

    if (
      rr.code !== 0
    ) {

      throw new Error(
        rr.message ||
        'Pinterest Error'
      )
    }

    return {

      bookmark:

        rr.bookmark &&
        rr.bookmark !== '-end-'

          ? rr.bookmark

          : null,

      results:

        Array.isArray(
          rr?.data?.results
        )

          ? rr.data.results

          : [],
    }
  }

  // =============================
  // HEADERS
  // =============================

  headers(sourceUrl) {

    return {

      Accept:
        'application/json, text/javascript, */*, q=0.01',

      'Accept-Language':
        'es-419,es;q=0.9,en;q=0.8',

      'Cache-Control':
        'no-cache',

      Pragma:
        'no-cache',

      Referer:
        `${this.origin}${sourceUrl}`,

      Origin:
        'https://www.pinterest.com',

      'User-Agent':

'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',

      'X-Requested-With':
        'XMLHttpRequest',

      'X-Pinterest-AppState':
        'active',

      'X-APP-VERSION':
        '9c1d2f0',

      'X-Pinterest-PWS-Handler':
        'www/search/[scope].js',

      'X-Pinterest-Source-Url':
        sourceUrl,

      Cookie:
        COOKIE,

      DNT:
        '1'
    }
  }

  // =============================
  // FORMAT
  // =============================

  formatPin(pin = {}) {

    const pinner =
      pin.pinner || {}

    const image =
      this.extractImage(pin)

    const video =
      this.extractVideo(pin)

    const isVideo =
      Boolean(video)

    return {

      titulo:

        this.clean(
          pin.title
        ) ||

        this.clean(
          pin.grid_title
        ),

      autor:

        this.clean(
          pinner.full_name
        ) ||

        this.clean(
          pinner.username
        ),

      tipo:

        isVideo
          ? 'video'
          : 'imagen',

      url:
        this.pinUrl(pin),

      descarga:

        isVideo
          ? video
          : image
    }
  }

  // =============================
  // IMAGE
  // =============================

  extractImage(
    pin = {}
  ) {

    const images =
      pin.images || {}

    return (

      images.orig?.url ||

      images['736x']?.url ||

      images['474x']?.url ||

      images['236x']?.url ||

      null
    )
  }

  // =============================
  // VIDEO
  // =============================

  extractVideo(
    pin = {}
  ) {

    const list =
      pin?.videos
        ?.video_list

    if (!list) {

      return null
    }

    const qualities = [

      'V_1080P',

      'V_720P',

      'V_480P',

      'V_360P'
    ]

    for (
      const q of qualities
    ) {

      const meta =
        list[q]

      const url =
        meta?.url

      if (
        url &&
        url.endsWith('.mp4')
      ) {

        return url
      }
    }

    return null
  }

  // =============================
  // URL
  // =============================

  pinUrl(pin = {}) {

    return pin?.id

      ? `https://www.pinterest.com/pin/${pin.id}/`

      : null
  }

  // =============================
  // CLEAN
  // =============================

  clean(value) {

    if (
      value == null
    ) return null

    const text =
      String(value)
        .trim()

    return text || null
  }

  // =============================
  // UNIQUE
  // =============================

  uniqueBy(
    arr,
    keyFn
  ) {

    const map =
      new Map()

    for (
      const item of arr
    ) {

      const key =
        keyFn(item)

      if (
        !key ||
        map.has(key)
      ) continue

      map.set(
        key,
        item
      )
    }

    return [
      ...map.values()
    ]
  }
}

// ===============================
// INSTANCE
// ===============================

const pinterest =
  new Pinterest()

// ===============================
// EXPORT
// ===============================

export default {

  command: [
    'pin',
    'pinterest'
  ],

  category:
    'search',

  run: async (
    sock,
    m,
    args
  ) => {

    if (!args.length) {

      return m.reply(

`✿ Ingresa una búsqueda

Ejemplo:
.pin gatos
.pin anime
.pin paisajes`
      )
    }

    const query =
      args.join(' ')

    try {

      await sock.sendMessage(
        m.chat,
        {
          react: {
            text: '📌',
            key: m.key
          }
        }
      )

      const result =
        await pinterest.search(
          query,
          10
        )

      if (
        !result.status
      ) {

        return m.reply(
          '❌ ' +
          result.msg
        )
      }

      if (
        !result.data.length
      ) {

        return m.reply(
          '❌ Sin resultados'
        )
      }

      for (
        const item of result.data
      ) {

        if (
          item.tipo ===
          'video'
        ) {

          await sock.sendMessage(
            m.chat,
            {
              video: {
                url:
                  item.descarga
              },

              caption:

`📌 Pinterest Video

📝 ${item.titulo || '-'}

👤 ${item.autor || '-'}`
            },
            {
              quoted: m
            }
          )

        } else {

          await sock.sendMessage(
            m.chat,
            {
              image: {
                url:
                  item.descarga
              },

              caption:

`📌 Pinterest Image

📝 ${item.titulo || '-'}

👤 ${item.autor || '-'}`
            },
            {
              quoted: m
            }
          )
        }
      }

    } catch (e) {

      console.log(e)

      m.reply(
        '❌ Error Pinterest'
      )
    }
  },
}
