<template>
  <Main></Main>
</template>

<script>
import Main from "./views/Main"

export default {
  name: "App",
  components: {
    Main,
  },
  data() {
    return {}
  },
}
</script>

<style lang="stylus">
  html,
  body
    padding 0
    margin 0
    overflow hidden

</style>
