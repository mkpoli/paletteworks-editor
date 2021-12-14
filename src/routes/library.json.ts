import { list, create } from '$lib/server/api'
import type { Item } from '$lib/server/api'
import type { Request } from '@sveltejs/kit'
export async function get() {
  const data = await list()
  return {
    body: data
  }
}

export async function post({ body }: Request) {
  try {
    await create(body as unknown as Item)
    return {
      status: 200
    }
  } catch (error) {
    console.error(error)
    return {
      status: 400
    }
  }
}