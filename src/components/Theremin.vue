<template>
  <div id="theremin-wrap">

    <div id="theremin" ref="theremin">
      <matrix-rain id="matrix-rain" ref="rain"/>
      <div id="overlay" :style="{
        opacity: opacity.value/100,
        backgroundColor,
      }"></div>
      <!--<span>theremin</span>-->
    </div>
    <div id="info">
      <div id="controls">
        <label>
          <span class="label">Choose octave to start from:</span>
          <select v-model="octaveOffset">
            <option v-for="option in octaveOffsetOptions"
                    :key="option"
                    :value="option">
              {{ option }}
            </option>
          </select>
        </label>
        <label>
          <span class="label">Choose type of sound:</span>
          <select v-model="oscillatorType">
            <option v-for="( option, index ) in oscillatorTypes"
                    :key="index"
                    :value="option">
              {{ option }}
            </option>
          </select>
        </label>
        <label>
          <span class="label">Background opacity: {{ (opacity.value/opacity.max).toFixed(2) }}</span>
          <input id="volume" type="range"
                 v-model="opacity.value"
                 :min="opacity.min"
                 :max="opacity.max">
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import {
  mapState,
} from "vuex"
import MatrixRain from "./MatrixRain"

export default {
  name: "theremin",
  components: {
    MatrixRain,
  },
  props: [
    "audioCtx",
  ],
  data() {
    return {
      octaveOffset: 2,
      oscillator: null,
      gain: null,
      playSoundGain: null,
      oscillatorType: null,
      isPlaying: false,
      opacity: {
        value: 100,
        min: 0,
        max: 100,
      },
      defBgColor: getComputedStyle( document.documentElement )
        .getPropertyValue( "--main-bg-color" ),
    }
  },
  mounted() {
    const typeChoice = 0
    this.oscillatorType = this.oscillatorTypes[ typeChoice ]

    this.oscillator = this.audioCtx.createOscillator()
    this.gain = this.audioCtx.createGain()

    this.oscillator.connect( this.gain )
    this.gain.connect( this.audioCtx.destination )

    this.oscillator.type = this.oscillatorType

    this.$refs.theremin.addEventListener( "mousedown", this.downEventListener, false )
    this.$refs.theremin.addEventListener( "mouseup", this.upEventListener, false )
    this.$refs.theremin.addEventListener( "mousemove", this.moveEventListener, false )
    this.$refs.theremin.addEventListener( "touchstart", this.downEventListener, false )
    this.$refs.theremin.addEventListener( "touchend", this.upEventListener, false )
    this.$refs.theremin.addEventListener( "touchmove", this.moveEventListener, false )
  },
  beforeDestroy() {
    if ( this.oscillator.started ) {
      this.oscillator.started = false
      this.oscillator.stop()
    }
    this.$refs.theremin.removeEventListener( "mousedown", this.downEventListener, false )
    this.$refs.theremin.removeEventListener( "mouseup", this.upEventListener, false )
    this.$refs.theremin.removeEventListener( "mousemove", this.moveEventListener, false )
    this.$refs.theremin.removeEventListener( "touchstart", this.downEventListener, false )
    this.$refs.theremin.removeEventListener( "touchend", this.upEventListener, false )
    this.$refs.theremin.removeEventListener( "touchmove", this.moveEventListener, false )
  },
  methods: {
    downEventListener( event ) {
      if ( this.isPlaying ) {
        return
      }

      if ( this.audioCtx.state === "suspended" ) {
        this.audioCtx.resume()
      }

      if ( !this.oscillator.started ) {
        this.oscillator.started = true
        this.oscillator.start()
      }

      this.isPlaying = true

      const freq = this.calculateFrequency( event )
      this.setFrequency( freq )

      const vol = this.calculateVolume( event )
      const delay = 0.01
      this.gain.gain.exponentialRampToValueAtTime( vol, this.audioCtx.currentTime + delay )
    },
    upEventListener( event ) {
      if ( !this.isPlaying ) {
        return
      }

      this.isPlaying = false
      const val = 0.0001
      const delay = 0.01
      this.gain.gain.exponentialRampToValueAtTime( val, this.audioCtx.currentTime + delay )
    },
    moveEventListener( event ) {
      if ( this.isPlaying ) {
        this.setFrequency( this.calculateFrequency( event ) )
        this.setVolume( this.calculateVolume( event ) )
      }
    },
    setFrequency( value ) {
      this.oscillator.frequency.value = value
    },
    calculateFrequency( event ) {
      const x = event.type.match( "mouse" )
        ? event.clientX
        : event.touches[ "0" ].clientX
      // eslint-disable-next-line no-magic-numbers
      const middleSize = this.$refs.theremin.offsetWidth / 2
      // eslint-disable-next-line no-magic-numbers
      const octaveScalingFactor = this.numberOfNotesInOctave * 2

      const val = ( x - middleSize ) * octaveScalingFactor / middleSize
      const magicNumber = 1.059463094359295264
      return this.currentMidFrequency * Math.pow( magicNumber, val )
    },
    setVolume( value ) {
      this.gain.gain.setValueAtTime( value, this.audioCtx.currentTime )
    },
    calculateVolume( event ) {
      const y = event.type.match( "mouse" )
        ? event.clientY
        : event.touches[ "0" ].clientY
      // eslint-disable-next-line no-magic-numbers
      return 1 - Math.min( 1, Math.max( 0, ( y / this.$refs.theremin.offsetHeight ) ) )
    },
  },
  computed: {
    ...mapState( [
      "notes",
      "frequencies",
      "keys",
      "numberOfMajorNotesInOctave",
      "numberOfNotesInOctave",
      "octaveOffsetOptions",
      "oscillatorTypes",
      "modes",
    ] ),
    minIndex() {
      return this.numberOfNotesInOctave * this.octaveOffset
    },
    maxIndex() {
      return this.numberOfNotesInOctave * ( this.octaveOffset + this.keys.length / this.numberOfMajorNotesInOctave )
    },
    currentMidFrequency() {
      // eslint-disable-next-line no-magic-numbers
      const midIndex = ( this.minIndex + this.maxIndex ) / 2
      return this.frequencies[ midIndex ]
    },
    backgroundColor() {
      return this.defBgColor
      // // eslint-disable-next-line no-magic-numbers
      // const beg = this.$refs.rain.ELEMENT_WIDTH * 0
      // // eslint-disable-next-line no-magic-numbers
      // const mid = this.$refs.rain.ELEMENT_WIDTH * 1
      // // eslint-disable-next-line no-magic-numbers
      // const end = this.$refs.rain.ELEMENT_WIDTH * 2
      // console.log( beg, mid, end )
      // return `repeating-linear-gradient(
      //   to right,
      //   var(--main-bg-color) ${beg}px,
      //   var(--main-bg-color) ${mid}px,
      //   var(--main-color) ${mid}px,
      //   var(--main-color) ${end}px
      // )`
    },
  },
  watch: {
    oscillatorType( val ) {
      this.oscillator.type = val
    },
  },
}
</script>

<style lang="stylus">
  #theremin-wrap
    flex 1 1 auto
    width 100%
    display flex
    flex-direction column
    justify-content stretch

  #theremin
    position relative
    box-sizing border-box
    height 100%
    width 100%

    display flex
    align-items center
    justify-content center

    border 2px solid var(--main-color)
    user-select none
    cursor pointer

    & > span
      text-transform uppercase
      text-shadow: 0 0 0.25em var(--main-bg-color), 0 0 0.5em var(--main-bg-color)
      font-size 2.5em
      font-weight bold
      z-index 1

  #matrix-rain
    position absolute
    height 100%
    width 100%

  #overlay
    position absolute
    height 100%
    width 100%
</style>
