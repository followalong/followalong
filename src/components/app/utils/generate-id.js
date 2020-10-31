import uniqId from 'uniq-id'

export default function () {
  return uniqId.generateUUID('xxxxyxxxxyxxxxyxxxxyxxxxyxxxxyxxxxyxxxxy', 32)()
}
