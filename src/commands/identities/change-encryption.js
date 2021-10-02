import generateId from '@/components/app/utils/generate-id.js'

export default function (app, keychain, store, identity, strategy, key, revert) {
  if (strategy === 'none') {
    app.saveToInMemoryKeychain(keychain, identity, 'none')
    app.saveToInStoreKeychain(keychain, store, identity, 'none')

    identity.services.local.strategy = strategy
    identity.save()
  } else if (strategy === 'ask') {
    const newKey = prompt('Choose a password')

    if (newKey === null) {
      revert()
    } else {
      identity.services.local.strategy = strategy

      app.saveToInMemoryKeychain(keychain, identity, newKey)
      app.saveToInStoreKeychain(keychain, store, identity, 'ask')

      identity.save()
    }
  } else if (strategy === 'rotate') {
    const rotateKey = generateId()

    app.saveToInMemoryKeychain(keychain, identity, rotateKey)
    app.saveToInStoreKeychain(keychain, store, identity, rotateKey)

    identity.services.local.strategy = strategy
    identity.save()
  } else if (strategy === 'store') {
    const newKey = prompt('Choose a password')

    if (newKey === null) {
      revert()
    } else {
      identity.services.local.strategy = strategy

      app.saveToInMemoryKeychain(keychain, identity, newKey)
      app.saveToInStoreKeychain(keychain, store, identity, newKey)

      identity.save()
    }
  }
}
