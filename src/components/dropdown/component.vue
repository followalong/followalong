<template>
  <div class="dropdown relativizer">
    <a
      href="javascript:;"
      @click="showMenu = !showMenu"
    >
      <font-awesome-icon
        icon="bars"
        class="i"
      />
    </a>

    <ul
      v-if="showMenu"
      class="actions"
      @click="showMenu = !showMenu"
    >
      <slot />
    </ul>
  </div>
</template>

<script>
export default {
  data () {
    return {
      showMenu: false
    }
  }
}
</script>
