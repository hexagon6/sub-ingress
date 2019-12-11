import test from 'ava'

import ingress from '../ingress.mjs'

test('should not fail', t => t.true(true))

test.before(async t => {
  ingress()
})

test('ingress should start', t => t.true(true))
