import { streamText } from 'ai'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { openrouter } from '@/lib/openRouter'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { itemId, prompt } = await req.json()

  if (!itemId || !prompt?.trim()) {
    return NextResponse.json(
      { error: 'Missing itemId or prompt' },
      { status: 400 }
    )
  }

  const item = await prisma.savedItem.findFirst({
    where: { id: itemId, userId: session.user.id },
  })

  if (!item) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const result = streamText({
    model: openrouter.chat('arcee-ai/trinity-large-preview:free'),
    system: `
You are a helpful assistant that summarizes text concisely.
- 2–3 paragraphs
- Focus on key points
- Clear language
    `,
    prompt: `Summarize the following content:\n\n${prompt}`,
  })

  return result.toTextStreamResponse()
}

