<template>
  <div class="me">
    <div class="title-wrapper">
        <h1>Me as {{identity.name}}.</h1>
    </div>
    <p>My posts, edit my profile.</p>
  </div>
</template>

<script>
export default {
  name: 'me',
  props: ['identity']
};
</script>
