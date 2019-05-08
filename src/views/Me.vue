<template>
  <div class="me">
    <h1>Me as {{identity.name}}.</h1>
    <p>My posts, edit my profile.</p>
  </div>
</template>

<script>
export default {
  name: 'me',
  props: ['identity']
};
</script>
