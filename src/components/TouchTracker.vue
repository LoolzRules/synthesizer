<template>
  <canvas ref="tracker"></canvas>
</template>

<script>
import { mapState, } from "vuex"
import hexToRGBA from "../utils/hexToRGBA"

export default {
  name: "touch-tracker",
  data() {
    return {
      gCtx: null,
      touches: null,
      DURATION: 500,
      RAD: 25,
      TOUCH_TRANSPARENCY: 0.5,
      animID: null,
      lastTouchIsPreserved: null,
    }
  },
  computed: {
    ...mapState( "app", [
      "colorSchemes",
      "colorScheme",
    ] ),
  },
  watch: {
    colorScheme( val ) {
      this.gCtx.fillStyle = hexToRGBA( this.colorSchemes[ val ][ 0 ], this.TOUCH_TRANSPARENCY )
    },
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
      this.gCtx.fillStyle = hexToRGBA(
        this.colorSchemes[ this.colorScheme ][ 0 ],
        this.TOUCH_TRANSPARENCY
      )

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
