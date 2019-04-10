<template>
  <canvas ref="tracker"></canvas>
</template>

<script>
export default {
  name: "touch-tracker",
  data() {
    return {
      gCtx: null,
      touches: null,
      DURATION: 500,
      RAD: 25,
      animID: null,
      lastTouchIsPreserved: null,
    }
  },
  mounted() {
    this.init()
  },
  beforeDestroy() {
    if ( this.animID ) window.cancelAnimationFrame( this.animID )
  },
  methods: {
    init() {
      this.$refs.tracker.height = this.$refs.tracker.offsetHeight
      this.$refs.tracker.width = this.$refs.tracker.offsetWidth

      this.gCtx = this.$refs.tracker.getContext( "2d" )
      this.gCtx.fillStyle = "rgba(0, 255, 0, 0.5)"

      this.touches = []
      this.update()
    },
    update( time ) {
      this.gCtx.clearRect( 0, 0, this.$refs.tracker.width, this.$refs.tracker.height )

      if ( this.lastTouchIsPreserved ) {
        const lastTouch = this.touches.pop()
        if ( lastTouch ) {
          lastTouch.t = time
          this.touches.push( lastTouch )
        }
      }

      this.touches
        .filter( t => time <= t.t + this.DURATION )
        .forEach( t => {
          this.gCtx.beginPath()
          this.gCtx.arc(
            t.x, t.y,
            this.RAD * ( 1 - ( time - t.t ) / this.DURATION ),
            0, Math.PI * 2,
          )
          this.gCtx.closePath()
          this.gCtx.fill()
        } )

      this.animID = window.requestAnimationFrame( this.update )
    },
    preserveLast() {
      this.lastTouchIsPreserved = true
    },
    releaseLast() {
      this.lastTouchIsPreserved = false
    },
    resize() {
      if ( this.animID ) window.cancelAnimationFrame( this.animID )
      this.init()
    },
  },
}
</script>

<style lang="stylus">
</style>
