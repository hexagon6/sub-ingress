import { URL } from 'url'

import { fetch } from './fetch.mjs'
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
      const url = `http://${target}${originalUrl}`
      logRP('➡️')(`redirecting "${domain}" -> (${target})`)
      logRP('🎯')(`redirect to ${url} with method: [${method}]`)
      fetch(logRP)(res, req.headers, method, url, data)
    })
  } else {
    res.statusCode = 421
    res.end('Misdirected request, no such domain configured')
  }
}
