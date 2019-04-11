<template>
  <div id="loading-screen">
    <span>
      Loading{{dots}}
    </span>
  </div>
</template>

<script>
export default {
  name: "loading-screen",
  data() {
    return {
      dots: null,
      intervalID: null,
      DURATION: 250,
    }
  },
  mounted() {
    this.dots = ""
    const maxDots = 3
    this.intervalID = setInterval( () => {
      if ( this.dots.length === maxDots ) {
        this.dots = ""
        return
      }
      this.dots += "."
    }, this.DURATION )
  },
  beforeDestroy() {
    clearInterval( this.intervalID )
  },
}
</script>

<style lang="stylus">
  #loading-screen
    position absolute
    top 50vh
    left 50vw
    margin-top -50vh
    margin-left -50vw

    height 100vh
    width 100vw

    display flex
    align-items center
    justify-content center
    background-color var(--main-bg-color)

    & > span
      font-size 2em
      font-weight bold
</style>
