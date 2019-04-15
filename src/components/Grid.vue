<template>
  <canvas ref="grid"></canvas>
</template>

<script>
import { mapState, } from "vuex"
import numToCol from "../utils/numToCol"

export default {
  name: "grid",
  data() {
    return {
      gCtx: null,
    }
  },
  computed: {
    ...mapState( "app", [
      "colorSchemes",
      "colorScheme",
    ] ),
    ...mapState( "theremin", [
      "numberOfNotesInOctave",
      "octaveRange",
      "volumeConfig",
    ] ),
  },
  watch: {
    colorScheme() {
      this.init()
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.$refs.grid.height = this.$refs.grid.offsetHeight
      this.$refs.grid.width = this.$refs.grid.offsetWidth

      this.gCtx = this.$refs.grid.getContext( "2d" )

      this.gCtx.clearRect( 0, 0, this.$refs.grid.width, this.$refs.grid.height )

      const numberOfNotes = this.octaveRange * this.numberOfNotesInOctave
      const numberOfVerticalLines = numberOfNotes - 2
      const width = this.$refs.grid.width / ( numberOfNotes - 1 )

      for ( let i = 0; i < numberOfVerticalLines; i++ ) {
        this.gCtx.moveTo( ( i + 1 ) * width, 0 )
        this.gCtx.lineTo( ( i + 1 ) * width, this.$refs.grid.height )
      }

      const numberOfHorizontalLines = this.volumeConfig.diff / this.volumeConfig.steps - 2
      const height = this.$refs.grid.height / ( this.volumeConfig.diff / this.volumeConfig.steps - 1 )

      for ( let i = 0; i < numberOfHorizontalLines; i++ ) {
        this.gCtx.moveTo( 0, ( i + 1 ) * height )
        this.gCtx.lineTo( this.$refs.grid.width, ( i + 1 ) * height )
      }

      this.gCtx.strokeStyle = numToCol( this.colorSchemes[ this.colorScheme ][ 0 ] )
      this.gCtx.stroke()
    },
    resize() {
      this.init()
    },
  },
}
</script>

<style lang="stylus">
</style>
