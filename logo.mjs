import fs from 'fs'

const logo = fs.readFileSync('logo.ascii', { encoding: 'utf8' })

export default logo
