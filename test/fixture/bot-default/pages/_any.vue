<template>
<code v-html="$exp"></code>  
</template>

<script>
export default {
  mounted() {
    window.$exp = this.$exp
  },
}
</script>
