<template>
  <div
    v-if="type"
    class="modal"
  >
    <div class="content-wrapper">
      <div
        class="overlay"
        @click="close"
      />
      <div class="content">
        <a
          class="close"
          @click="close"
        >&times;</a>
        <h3>{{ type.name }}</h3>
        <p>{{ type.description }}</p>
        <form @submit="save">
          <div
            class="field"
          >
            <label for="service-name">Which service would you like to use?</label>
            <select
              id="service-name"
              v-model="selectedAddon"
              :aria-label="`${type.shortName} addon name`"
            >
              <option
                v-for="addon in addons"
                :key="addon.key"
                :value="addon"
              >
                {{ addon.name }}
              </option>
            </select>
            <p
              class="hint"
              v-html="selectedAddon.description"
            />
          </div>
          <div
            v-for="(field, key) in selectedAddon.fields"
            :key="`field-${key}`"
            class="field"
          >
            <label :for="`field-${key}`">{{ field.label }}</label>
            <input
              :id="`field-${key}`"
              v-model="data[key]"
              :type="field.type"
              :required="field.required"
              :placeholder="field.placeholder"
            >
            <p
              class="hint"
              v-html="field.hint"
            />
          </div>
          <div class="actions">
            <button
              :aria-label="`Save ${type.shortName} addon`"
              type="submit"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import ADDONS from '@/adapters/addons/index.js'

export default {
  props: ['app', 'type', 'close', 'save'],
  data () {
    return {
      selectedAddon: null,
      data: {}
    }
  },
  computed: {
    addons () {
      return ADDONS.map((Addon) => {
        return new Addon()
      }).filter((addon) => addon.supports.indexOf(this.type.key) !== -1)
    }
  },
  watch: {
    selectedAddon () {
      this.data = Object.assign({}, this.selectedAddon.data)
    },
    type (val) {
      if (val) {
        document.body.style.overflow = 'hidden'
        this.selectedAddon = this.app.queries.addonForIdentity(this.app.identity, this.type.key)
      } else {
        document.body.style.overflow = ''
      }
    }
  }
}
</script>
