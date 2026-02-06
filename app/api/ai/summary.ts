// src/routes/api/ai/summary.ts
import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'
import { prisma } from '@/db'
import { auth } from '@/lib/auth'
import { openrouter } from '@/lib/openRouter'

export const Route = createFileRoute('/api/ai/summary')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 1. Validate the Session
        const session = await auth.api.getSession({
          headers: request.headers,
        })

        if (!session?.user) {
          return new Response('Unauthorized: Please log in again.', { status: 401 })
        }

        // 2. Parse the Request Body
        const { itemId, prompt } = await request.json()

        if (!itemId || !prompt) {
          return new Response('Missing itemId or prompt', { status: 400 })
        }

        // 3. Query Database with the validated User ID
        const item = await prisma.savedItem.findUnique({
          where: { 
            id: itemId, 
            userId: session.user.id 
          },
        })

        if (!item) {
          return new Response('Item not found or access denied', { status: 404 })
        }

        // 4. Stream summary from OpenRouter
        const result = streamText({
          model: openrouter.chat('xiaomi/mimo-v2-flash:free'),
          system: `You are a helpful assistant that summarizes text content concisely, focusing on key points, informative summaries of web content, and clarity. Your summaries should:
        - Be 2-3 paragraphs long
        - Capture the main ideas and essential details
        - Use clear and simple language`,
          prompt: `Please summarize the following content:\n\n${prompt}`,
        })

        // 5. Return the streaming response
        return result.toTextStreamResponse()
      },
    },
  },
})