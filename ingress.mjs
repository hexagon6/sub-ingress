import polka from 'polka'

import { assignTargetDomain, reverseProxy } from './handlers.mjs'

//  GET  HEAD  PATCH  OPTIONS  CONNECT  DELETE  TRACE  POST  PUT
const start = (domainConfig, { port }) =>
  polka()
    .use(assignTargetDomain(domainConfig))
    .get('/*', reverseProxy)
    .head('/*', reverseProxy)
    .patch('/*', reverseProxy)
    .options('/*', reverseProxy)
    .connect('/*', reverseProxy)
    .delete('/*', reverseProxy)
    .trace('/*', reverseProxy)
    .post('/*', reverseProxy)
    .put('/*', reverseProxy)
    .listen(port, err => {
      if (err) throw err
      console.log(`> 🏃‍: Running on ${port}`)
      console.log('ingress is starting with config: ', domainConfig)
    })

export default start
