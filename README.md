# FollowAlong

## Todo

- Better search
- Make Services approachable
- Better media player
- Simplify loading

## Past Todo
- Public
  - when app.subscribe, prompt login if POSSIBLE
    - Optional Login
    - Required Login
  - Feed page
    - Actions
    - Expired notice
    - See only the items I'm supposed to with Basic Auth
- Admin
  - Plans (do not renew, because, who likes that?)
    - name
    - duration
    - amount [custom]
    - currency
    - ordinal
    - details
      - commentable
      - require address
      - require mobile
  - Memberships
    - user (update details), plan, amount, expireAt, confirmationToken
    - refund
    - CRUD
  - Users
    - Add subscribers with/without paying
    - `Paid Subscriber` scope
  - Settings
    - Allowed to register?
    - Allowed to pay?
    - Set user level (default `subscriber`)

## Why Am I still using YouTube / FB / News Sites?
- Play songs (looking for specific content)
- Discover (looking for new content)
- Interact in a group (comment / like / share)

## Project setup
```
yarn
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Run your tests
```
yarn test:unit
```

### Lints and fixes files
```
yarn lint:fix
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
