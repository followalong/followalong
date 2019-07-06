<template>
  <div class="narrow-container">
    <h1>Changeblog</h1>

    <div v-for="(summary, version) in app.changelog" :key="version">
      <h3>
        Version {{version}}
      </h3>

      <p>
        {{summary}}
      </p>

      <hr>
    </div>
  </div>
</template>

<script>
export default {
  name: 'updates',
  props: ['app']
};
</script>
