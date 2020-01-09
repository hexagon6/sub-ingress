import send from '@polka/send-type'
import axios from 'axios'
import __ from 'ramda/src/__.js'
import modulo from 'ramda/src/modulo.js'
import zip from 'ramda/src/zip.js'

// transform a list of headers into headers object to keep exact case of header names. (since res.headers converts to lowercase names)
const isOdd = modulo(__, 2)
const transformHeaders = rawHeaders =>
  Object.fromEntries(
    zip(
      rawHeaders.filter((_, i) => !isOdd(i)),
      rawHeaders.filter((_, i) => isOdd(i))
    )
  )

export const fetch = (log = () => console.log) => (
  res,
  headers,
  method,
  url,
  data
) =>
  axios({
    maxRedirects: 0,
    method,
    headers,
    url,
    responseType: 'stream',
    data,
  })
    .then(backend => {
      const {
        status,
        headers,
        request: {
          res: { rawHeaders },
        },
      } = backend
      log('⬅️')(
        `received answer from backend with status [${status}] and headers [${Object.keys(
          headers
        )}]`
      )
      log('📏')(`content-length of: ${headers['content-length']}`)
      res.statusCode = status

      send(res, 206, backend.data, {
        ...transformHeaders(rawHeaders),
      })
    })
    .catch(error => {
      if (error.response) {
        log('🤭')(
          `backend responded with [${error.response.status}], I give it back to frontend`
        )
        if (error.response.status > 300) {
          res.statusCode = error.response.status
          res.writeHead(error.response.status, error.response.headers)
          res.end(error.response.data)
        }
        res.statusCode = error.response.status
        res.end(error.response.data)
      } else {
        if (error.isAxiosError) {
          console.error('axios is to blame')
        }
        const { code, address, port, syscall } = error
        if (code === 'ECONNREFUSED') {
          log('⛔')(`Connection refused to [${address}:${port}] on ${syscall}`)
          res.statusCode = 502
          res.end('Bad Gateway')
        } else if (code === 'ECONNRESET') {
          log('❌')(`Connection reset`)
          res.statusCode = 503
          res.end('Service Unavailable')
        } else {
          log('🚨')(`Fetching failed with: `)
          console.error(error)
          log('💩')(`500 Internal Server Error`)
          res.statusCode = 500
          res.end('Internal Server Error')
        }
      }
    })
