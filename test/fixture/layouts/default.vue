<template>
  <nuxt />
</template>

<script>
export default {
      head() {
        return {
            bodyAttrs: {
                class: [...this.$experiment.$classes].join(' ')
            }
        }
    },
}
</script>
