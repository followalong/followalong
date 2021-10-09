const BASE64_CHARACTERS = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/

export default function (str) {
  return BASE64_CHARACTERS.test(str)
}
