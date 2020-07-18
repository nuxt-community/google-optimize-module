<template>
<code v-html="JSON.stringify($exp)"></code>  
</template>

<script>
export default {
  mounted() {
    window.$exp = this.$exp
  },
}
</script>
