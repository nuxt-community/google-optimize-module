<template>
  <nuxt />
</template>

<script>
export default {
      head() {
        return {
            bodyAttrs: {
                class: [...this.$exp.$classes].join(' ')
            }
        }
    },
}
</script>
