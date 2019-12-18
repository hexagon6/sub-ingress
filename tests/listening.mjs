import net from 'net'

import test from 'ava'

import ingress from '../ingress.mjs'

const port = 3001
test.before(async t => {
  process.env.PORT = port
  ingress({ 'www.example.com': '127.0.0.0:3001' }, { port })
})

test.cb('ingress should start and listen on defined port', t => {
  net.connect({ port }, t.end)
})
