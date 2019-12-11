import fs from 'fs'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const logo = fs.readFileSync(path.join(__dirname, './logo.ascii'), {
  encoding: 'utf8',
})

export default logo
