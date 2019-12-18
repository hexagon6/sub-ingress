#!/usr/bin/env node

import ingress from './ingress.mjs'
import logo from './logo.mjs'
import configure from './configure.mjs'

const PORT = process.env.PORT || 3000

const domainList = configure()
console.log(logo)

ingress(domainList, { port: PORT })
