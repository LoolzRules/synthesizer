<template>
  <canvas ref="matrixRain"></canvas>
</template>

<script>
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
      colors: [
        "rgb(0, 255, 0)",
        "rgb(0, 238, 0)",
        "rgb(0, 221, 0)",
        "rgb(0, 204, 0)",
        "rgb(0, 187, 0)",
        "rgb(0, 170, 0)",
        "rgb(0, 153, 0)",
        "rgb(0, 136, 0)",
        "rgb(0, 119, 0)",
        "rgb(0, 102, 0)",
        "rgb(0, 85, 0)",
        "rgb(0, 68, 0)",
        "rgb(0, 51, 0)",
        "rgb(0, 34, 0)",
        "rgb(0, 17, 0)",
        "rgb(0, 0, 0)",
      ],
      rainIndices: null,
      MAX_VALUE: 0,
      DELAY: 100,
      ELEMENT_SIZE: 24,
      ROW_LENGTH: 0,
      COLUMN_LENGTH: 0,
      ELEMENT_WIDTH: 0,
      ELEMENT_HEIGHT: 0,
      LETTER_SCALING: 0.75,
      SHIFT_PROBABILITY: 0.5,
    }
  },
  mounted() {
    this.init()
    this.initRain()
  },
  methods: {
    init() {
      this.gCtx = this.$refs.matrixRain.getContext( "2d" )

      this.ELEMENT_SIZE = 24
      this.ROW_LENGTH = this.mathFloor( this.$refs.matrixRain.offsetWidth / this.ELEMENT_SIZE )
      this.COLUMN_LENGTH = this.mathFloor( this.$refs.matrixRain.offsetHeight / this.ELEMENT_SIZE )
      this.ELEMENT_WIDTH = this.$refs.matrixRain.offsetWidth / this.ROW_LENGTH
      this.ELEMENT_HEIGHT = this.$refs.matrixRain.offsetHeight / this.COLUMN_LENGTH

      this.rainIndices = new Array( this.ROW_LENGTH )
      // eslint-disable-next-line no-magic-numbers
      this.MAX_VALUE = 2 * this.colors.length + this.COLUMN_LENGTH

      this.$refs.matrixRain.height = this.$refs.matrixRain.offsetHeight
      this.$refs.matrixRain.width = this.$refs.matrixRain.offsetWidth

      this.gCtx.textBaseline = "middle"
      this.gCtx.textAlign = "center"
      this.gCtx.font = `bold ${this.ELEMENT_SIZE * this.LETTER_SCALING}px Courier`
    },
    initRain() {
      const origin = 0
      this.placeRectangle(
        this.selectLast( this.colors ),
        origin, origin,
        this.$refs.matrixRain.width,
        this.$refs.matrixRain.height
      )

      for ( let i = 0; i < this.rainIndices.length; i++ ) {
        this.rainIndices[ i ] = this.mathFloor( Math.random() * this.MAX_VALUE ) - this.MAX_VALUE
      }

      return setInterval( this.updateRain, this.DELAY )
    },
    updateRain() {
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

            const letterGroupIndex = this.mathFloor( Math.random() * this.letters.length )
            const letterGroup = this.letters[ letterGroupIndex ]
            const shiftToCenter = 0.5
            this.placeLetter(
              color,
              letterGroup[ this.mathFloor( Math.random() * letterGroup.length ) ],
              ( i + shiftToCenter ) * this.ELEMENT_WIDTH,
              ( j + shiftToCenter ) * this.ELEMENT_HEIGHT
            )
          }
        }
      }
    },
    selectLast( array ) {
      // eslint-disable-next-line no-magic-numbers
      return array.slice( -1 ).pop()
    },
    mathFloor( val ) {
      // eslint-disable-next-line no-magic-numbers
      return val | 0
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
  },
}
</script>

<style lang="stylus">
</style>
