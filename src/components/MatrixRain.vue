<template>
  <canvas ref="matrixRain"></canvas>
</template>

<script>
import { mapState, } from "vuex"
import interpolateColors from "../utils/interpolateColors"

export default {
  name: "matrix-rain",
  data() {
    return {
      gCtx: null,
      letters: [
        "゠ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶヷヸヹヺ・ーヽヾヿ",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "0123456789",
      ],
      rainIndices: null,
      MAX_VALUE: 0,
      DELAY: 75,
      ELEMENT_SIZE: 24,
      ROW_LENGTH: 0,
      COLUMN_LENGTH: 0,
      ELEMENT_WIDTH: 0,
      ELEMENT_HEIGHT: 0,
      LETTER_SCALING: 0.75,
      SHIFT_PROBABILITY: 0.5,
      prevTime: null,
      animID: null,
      hasJustChanged: null,
    }
  },
  computed: {
    ...mapState( [
      "colorSchemes",
      "chosenColorScheme",
    ] ),
    colors() {
      // eslint-disable-next-line no-magic-numbers
      return interpolateColors( ...this.colorSchemes[ this.chosenColorScheme ], 16 )
    },
  },
  watch: {
    colors() {
      this.hasJustChanged = true
    },
  },
  mounted() {
    this.init()
    this.initRain()
  },
  beforeDestroy() {
    if ( this.animID ) window.cancelAnimationFrame( this.animID )
  },
  methods: {
    init() {
      this.gCtx = this.$refs.matrixRain.getContext( "2d" )

      this.ELEMENT_SIZE = 24
      this.ROW_LENGTH = ( this.$refs.matrixRain.offsetWidth / this.ELEMENT_SIZE ) | 0
      this.COLUMN_LENGTH = ( this.$refs.matrixRain.offsetHeight / this.ELEMENT_SIZE ) | 0
      this.ELEMENT_WIDTH = this.$refs.matrixRain.offsetWidth / this.ROW_LENGTH
      this.ELEMENT_HEIGHT = this.$refs.matrixRain.offsetHeight / this.COLUMN_LENGTH

      this.rainIndices = new Array( this.ROW_LENGTH )
      this.MAX_VALUE = 2 * this.colors.length + this.COLUMN_LENGTH

      this.$refs.matrixRain.height = this.$refs.matrixRain.offsetHeight
      this.$refs.matrixRain.width = this.$refs.matrixRain.offsetWidth

      this.gCtx.textBaseline = "middle"
      this.gCtx.textAlign = "center"
      const font = getComputedStyle( document.documentElement )
        .getPropertyValue( "--font" )
      this.gCtx.font = `bold ${this.ELEMENT_SIZE * this.LETTER_SCALING}px ${font}`
    },
    initRain() {
      this.hasJustChanged = true

      for ( let i = 0; i < this.rainIndices.length; i++ ) {
        this.rainIndices[ i ] = ( ( Math.random() * this.MAX_VALUE ) | 0 ) - this.MAX_VALUE
      }

      this.prevTime = -Infinity
      this.updateRain()
    },
    updateRain( time ) {
      if ( time - this.DELAY < this.prevTime ) {
        this.animID = window.requestAnimationFrame( this.updateRain )
        return
      }

      this.prevTime = time

      if ( this.hasJustChanged ) {
        this.hasJustChanged = false
        const origin = 0
        this.placeRectangle(
          this.selectLast( this.colors ),
          origin, origin,
          this.$refs.matrixRain.width,
          this.$refs.matrixRain.height
        )
      }

      for ( let i = 0; i < this.ROW_LENGTH; i++ ) {
        this.rainIndices[ i ] = ++this.rainIndices[ i ] % this.MAX_VALUE
        if ( this.rainIndices[ i ] > this.colors.length + this.COLUMN_LENGTH && Math.random() > this.SHIFT_PROBABILITY ) {
          this.rainIndices[ i ] = 0
        }

        for ( let j = 0; j < this.COLUMN_LENGTH; j++ ) {
          const colorIndex = this.rainIndices[ i ] - j
          const color = this.colors[ colorIndex ]

          if ( color ) {
            this.placeRectangle(
              this.selectLast( this.colors ),
              i * this.ELEMENT_WIDTH,
              j * this.ELEMENT_HEIGHT,
              this.ELEMENT_WIDTH,
              this.ELEMENT_HEIGHT
            )

            const letterGroupIndex = Math.random() * this.letters.length | 0
            const letterGroup = this.letters[ letterGroupIndex ]
            const shiftToCenter = 0.5
            this.placeLetter(
              color,
              letterGroup[ Math.random() * letterGroup.length | 0 ],
              ( i + shiftToCenter ) * this.ELEMENT_WIDTH,
              ( j + shiftToCenter ) * this.ELEMENT_HEIGHT
            )
          }
        }
      }

      this.animID = window.requestAnimationFrame( this.updateRain )
    },
    selectLast( array ) {
      // eslint-disable-next-line no-magic-numbers
      return array.slice( -1 ).pop()
    },
    placeRectangle( col, x1, y1, x2, y2 ) {
      this.gCtx.shadowBlur = 0
      this.gCtx.shadowColor = col
      this.gCtx.fillStyle = col
      this.gCtx.fillRect( x1, y1, x2, y2 )
    },
    placeLetter( col, l, x, y ) {
      this.gCtx.shadowBlur = 4
      this.gCtx.shadowColor = col
      this.gCtx.fillStyle = col
      this.gCtx.fillText( l, x, y )
    },
    resize() {
      if ( this.animID ) window.cancelAnimationFrame( this.animID )
      this.init()
      this.initRain()
    },
  },
}
</script>

<style lang="stylus">
</style>
