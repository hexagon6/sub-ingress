import { URL } from 'url'

import send from '@polka/send-type'
import axios from 'axios'
import __ from 'ramda/src/__.js'
import modulo from 'ramda/src/modulo.js'
import zip from 'ramda/src/zip.js'

import logger from './logger.mjs'

const logTD = logger('🥔')
export const assignTargetDomain = domainList => {
  return (req, _, next) => {
    const { host } = req.headers
    if (host) {
      const { hostname } = new URL(`http://${host}`)
      req.domain = hostname
      const target = domainList[hostname]
      if (target) {
        logTD('🤓')(`found match for [${hostname}] -> (${target})`)
        req.target = target
      } else {
        logTD('🤷')(`no match found in config for: "${hostname}"`)
        req.target = null
      }
    }
    next()
  }
}

// transform a list of headers into headers object to keep exact case of header names. (since res.headers converts to lowercase names)
const isOdd = modulo(__, 2)
const transformHeaders = rawHeaders =>
  Object.fromEntries(
    zip(
      rawHeaders.filter((_, i) => !isOdd(i)),
      rawHeaders.filter((_, i) => isOdd(i))
    )
  )

const logRP = logger('🦉')
export const reverseProxy = (req, res) => {
  const { domain, target, method, originalUrl } = req
  logRP('📨')(`received request [${method}] on ${originalUrl}`)
  if (target) {
    const body = []
    req.on('data', chunk => {
      body.push(chunk)
    })
    req.on('end', () => {
      const data = body.join('')
      const newUrl = `http://${target}${originalUrl}`
      logRP('➡️')(`redirecting "${domain}" -> (${target})`)
      logRP('🎯')(`redirect to ${newUrl} with method: [${method}]`)
      axios({
        maxRedirects: 0,
        method,
        headers: req.headers,
        url: newUrl,
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
          logRP('⬅️')(
            `received answer from backend with status [${status}] and headers [${Object.keys(
              headers
            )}]`
          )
          logRP('📏')(`content-length of: ${headers['content-length']}`)
          res.statusCode = status

          send(res, 206, backend.data, {
            ...transformHeaders(rawHeaders),
          })
        })
        .catch(error => {
          if (error.response) {
            logRP('🤭')(
              `backend responded with [${error.response.status}], I give it back to frontend`
            )
            if (
              error.response.status === 301 ||
              error.response.status === 302
            ) {
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
              logRP('⛔')(
                `Connection refused to [${address}:${port}] on ${syscall}`
              )
              res.statusCode = 502
              res.end('Bad Gateway')
            } else if (code === 'ECONNRESET') {
              logRP('❌')(`Connection reset`)
              res.statusCode = 503
              res.end('Service Unavailable')
            } else {
              logRP('🚨')(`Fetching failed with: `)
              console.error(error)
              logRP('💩')(`500 Internal Server Error`)
              res.statusCode = 500
              res.end('Internal Server Error')
            }
          }
        })
    })
  } else {
    res.statusCode = 421
    res.end('Misdirected request, no such domain configured')
  }
}
