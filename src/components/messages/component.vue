<template>
  <div class="messages">
    <div class="title-wrapper">
      <h1>One day, you'll be able to message others directly as {{ app.identity.name }}!</h1>
    </div>
  </div>
</template>

<script>
export default {
  props: ['app']
}
</script>
