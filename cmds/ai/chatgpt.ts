// © Ado | 2026
// ChatGPT IA
// Compatible con TU AlyaBot-MD

import fetch from 'node-fetch'

// ===============================
// API
// ===============================

async function preguntarIA(text) {

  const res =
    await fetch(

`https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(text)}&botname=Alya&ownername=Ado`,

      {
        method: 'GET'
      }
    )

  if (!res.ok) {

    throw new Error(
      `HTTP ${res.status}`
    )
  }

  const json =
    await res.json()

  return json.message
}

// ===============================
// EXPORT
// ===============================

export default {

  command: [
    'ia',
    'chatgpt',
    'gpt',
    'ai'
  ],

  category:
    'ai',

  run: async (
    sock,
    m,
    args,
    command
  ) => {

    if (!args.length) {

      return m.reply(

`✿ Escribe una pregunta.

Ejemplo:
.ia hola
.gpt quien eres
.ai crea una historia`
      )
    }

    const text =
      args.join(' ')

    try {

      // =====================
      // REACT
      // =====================

      await sock.sendMessage(
        m.chat,
        {
          react: {
            text: '🧠',
            key: m.key
          }
        }
      )

      // =====================
      // IA
      // =====================

      const response =
        await preguntarIA(
          text
        )

      // =====================
      // SEND
      // =====================

      await m.reply(

`🧠 IA RESPONDE

${response}`
      )

    } catch (e) {

      console.log(e)

      m.reply(
        '❌ Error con la IA'
      )
    }
  },
}
