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
}
</script>

<style lang="stylus">
  html,
  body
    height 100vh
    width 100vw
    padding 0
    margin 0
    overflow hidden
    user-select none
    -webkit-tap-highlight-color transparent

</style>
