import aes256 from 'aes256'

const encrypt = (key) => {
  return (data) => aes256.encrypt(key, JSON.stringify(data))
}

const decrypt = () => {

}

const passThrough = () => {
  return (data) => data
}

export {
  encrypt,
  decrypt,
  passThrough
}
