// Tiny stand-ins for Express request and response objects
export const fakeRes = () => {
  const res: any = { locals: {}, headersSent: false, statusCode: 200, body: undefined as any }
  res.status = (code: number) => { res.statusCode = code; return res }
  res.json = (body: unknown) => { res.body = body; return res }
  return res
}
