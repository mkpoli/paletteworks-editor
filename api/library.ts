import type { VercelRequest, VercelResponse } from '@vercel/node'
import { list, create } from './api'

export default async (request: VercelRequest, response: VercelResponse) => {
  try {
    if (request.method === 'GET') {
      const data = await list()
      response.status(200).json(data)
    } else if (request.method === 'POST') {
      const data = await create(request.body)
      response.status(200).json(data)
    } else {
      response.status(405).end()
    }
  } catch (error) {
    console.error('❌ API error:', error)
    response.status(500).json({ message: 'Internal Server Error' })
  }
}
