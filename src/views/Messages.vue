<template>
  <div class="messages">
    <h1>One day, you'll be able to message others directly as {{identity.name}}!</h1>
  </div>
</template>

<script>
export default {
  name: 'messages',
  props: ['identity']
}
</script>
