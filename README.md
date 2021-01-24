# FollowAlong

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

### Findings

- Because we use an iframe to show videos, we can't append them to another `<div>` without the video restarting.
