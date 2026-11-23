import { Request } from 'express'

// ?limit= and ?page= for lists. Every public list has a ceiling, so one request can never pull the whole table.
export const pageOf = (req: Request, defaultLimit = 60, maxLimit = 200) => {
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? defaultLimit), 10) || defaultLimit, 1), maxLimit)
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1)
  return { take: limit, skip: (page - 1) * limit }
}
