export default prefix => {
  return prefix2 => {
    return (...msg) => console.log(`${prefix}${prefix2}: `, ...msg)
  }
}
