import { Where } from 'payload'

export function notDraftWhereFilter(where: Where): Where {
  return {
    and: [{ _status: { equals: 'published' } }, ...(where ? [where] : [])],
  }
}
