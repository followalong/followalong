<template>
  <div
    v-if="addonType"
    class="modal"
  >
    <div class="modal-content-wrapper">
      <div
        class="overlay"
        @click="close"
      />
      <div class="modal-content">
        <a
          class="close"
          @click="close"
        >&times;</a>
        <h3>{{ addonType.name }}</h3>
        <p>{{ addonType.description }}</p>
        <form
          v-if="selectedAddon"
          :aria-label="`Save ${addonType.shortName} addon`"
          @submit.prevent="save"
        >
          <div
            v-if="addons.length > 1"
            class="field"
          >
            <label for="service-name">Which service would you like to use?</label>
            <select
              id="service-name"
              v-model="selectedAddonAdapter"
              :aria-label="`${addonType.shortName} addon name`"
            >
              <option
                v-for="addon in addons"
                :key="addon.adapter"
                :value="addon.adapter"
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
              v-model="selectedAddon.data[key]"
              :type="field.type"
              :required="field.required"
              :placeholder="field.placeholder"
              :aria-label="`${addonType.shortName} addon ${key}`"
            >
            <p
              class="hint"
              v-html="field.hint"
            />
          </div>
          <div class="actions">
            <button
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
import { ADDONS } from '@/adapters/addons/index.js'

export default {
  props: ['app', 'existing', 'close'],
  data () {
    return {
      selectedAddonAdapter: this.existing.addon.adapter,
      existingAddon: this.existing.addon,
      addonType: this.existing.addonType
    }
  },
  computed: {
    addons () {
      return ADDONS
        .map((Addon) => new Addon({}, Object.assign({}, this.existing.addon.data)))
        .filter((addon) => addon.supports.indexOf(this.addonType.key) !== -1)
    },
    selectedAddon () {
      return this.addons.find((a) => a.adapter === this.selectedAddonAdapter)
    }
  },
  mounted () {
    document.body.style.overflow = 'hidden'
  },
  unmounted () {
    document.body.style.overflow = ''
  },
  methods: {
    save () {
      this.app.identity.addons = this.app.identity.addons || {}
      this.app.identity.addons[this.addonType.key] = this.selectedAddon.data || {}
      this.app.identity.addons[this.addonType.key].adapter = this.selectedAddonAdapter
      this.app.commands.saveLocal(this.app.identity)
      this.close()
    }
  }
}
</script>
