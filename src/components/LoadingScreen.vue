<template>
  <div>
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
</style>
