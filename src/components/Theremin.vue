<template>
  <div id="theremin-wrap">
    <div id="theremin" ref="theremin">
      <grid id="grid" ref="grid"/>
      <touch-tracker id="touch-tracker" ref="tracker"/>
    </div>
    <div id="info">
      <div id="controls">
        <label>
          <span class="label">Oscillator type:</span>
          <select v-model="oscillatorType">
            <option v-for="( option, index ) in oscillatorTypes"
                    :key="index"
                    :value="option">
              {{ option }}
            </option>
          </select>
        </label>
        <label>
          <span class="label">First octave:</span>
          <select v-model="octaveOffset">
            <option v-for="option in octaveOffsets"
                    :key="option"
                    :value="option">
              {{ option }}
            </option>
          </select>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, } from "vuex"
import Grid from "./Grid"
import TouchTracker from "./TouchTracker"
import Tone from "tone"

export default {
  name: "theremin",
  components: {
    Grid,
    TouchTracker,
  },
  data() {
    return {
      isPlaying: false,
      synth: null,
      volume: null,
    }
  },
  computed: {
    ...mapState( "theremin", [
      "frequencies",
      "numberOfNotesInOctave",
      "oscillatorTypes",
      "octaveOffsets",
      "octaveRange",
      "volumeConfig",
    ] ),
    oscillatorType: {
      get() {
        return this.$store.state.theremin.oscillatorType
      },
      set( type ) {
        this.$store.commit( "theremin/oscillatorType", type )
      },
    },
    octaveOffset: {
      get() {
        return this.$store.state.theremin.octaveOffset
      },
      set( offset ) {
        this.$store.commit( "theremin/octaveOffset", offset )
      },
    },
    minIndex() {
      return this.numberOfNotesInOctave * this.octaveOffset
    },
    maxIndex() {
      return this.numberOfNotesInOctave * ( this.octaveOffset + this.octaveRange ) - 1
    },
    currentMidFrequency() {
      const midIndex = ( this.minIndex + this.maxIndex ) / 2
      return this.frequencies[ midIndex | 0 ]
    },
  },
  watch: {
    oscillatorType() {
      this.synth.oscillator.set( {
        type: this.oscillatorType,
      } )
    },
  },
  mounted() {
    Tone.context.master.volume.value = 0

    const initialChoice = 0
    this.oscillatorType = this.oscillatorType
      ? this.oscillatorType
      : this.oscillatorTypes[ initialChoice ]
    this.octaveOffset = this.octaveOffset
      ? this.octaveOffset
      : this.octaveOffsets[ initialChoice ]

    this.synth = new Tone.Synth( {
      oscillator: {
        type: this.oscillatorType,
      },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    } ).toMaster()

    this.$refs.theremin.addEventListener( "mousedown", this.downEventListener, false )
    this.$refs.theremin.addEventListener( "mouseup", this.upEventListener, false )
    this.$refs.theremin.addEventListener( "mousemove", this.moveEventListener, false )
    this.$refs.theremin.addEventListener( "touchstart", this.downEventListener, false )
    this.$refs.theremin.addEventListener( "touchend", this.upEventListener, false )
    this.$refs.theremin.addEventListener( "touchmove", this.moveEventListener, false )

    window.addEventListener( "resize", this.resizeCallback, true )

    this.$parent.scheduleHideLoadingScreen()
  },
  beforeDestroy() {
    try {
      this.synth.dispose()
    } catch {
    }
    this.$refs.theremin.removeEventListener( "mousedown", this.downEventListener, false )
    this.$refs.theremin.removeEventListener( "mouseup", this.upEventListener, false )
    this.$refs.theremin.removeEventListener( "mousemove", this.moveEventListener, false )
    this.$refs.theremin.removeEventListener( "touchstart", this.downEventListener, false )
    this.$refs.theremin.removeEventListener( "touchend", this.upEventListener, false )
    this.$refs.theremin.removeEventListener( "touchmove", this.moveEventListener, false )

    window.removeEventListener( "resize", this.resizeCallback, true )
  },
  methods: {
    downEventListener( event ) {
      if ( this.isPlaying ) return
      this.isPlaying = true

      this.$refs.tracker.preserveLast()
      this.$refs.tracker.touches.push( this.calculateTouch( event ) )

      const freq = this.calculateFrequency( event )
      this.synth.triggerAttack( freq )

      this.synth.volume.value = this.calculateVolume( event )
    },
    upEventListener( event ) {
      this.isPlaying = false
      this.$refs.tracker.releaseLast()
      this.synth.triggerRelease()
    },
    moveEventListener( event ) {
      if ( !this.isPlaying ) return
      // event.preventDefault()
      this.$refs.tracker.touches.push( this.calculateTouch( event ) )
      this.synth.frequency.value = this.calculateFrequency( event )
      this.synth.volume.value = this.calculateVolume( event )
    },
    calculateFrequency( event ) {
      const x = event.type.match( "mouse" ) ? event.clientX : event.touches[ 0 ].clientX

      const middleSize = this.$refs.theremin.offsetWidth / 2
      const octaveScalingFactor = this.numberOfNotesInOctave * this.octaveRange / 2

      const val = ( x - middleSize ) * octaveScalingFactor / middleSize
      const magicNumber = 1.059463094359295264
      return this.currentMidFrequency * Math.pow( magicNumber, val )
    },
    calculateVolume( event ) {
      const y = event.type.match( "mouse" ) ? event.clientY : event.touches[ 0 ].clientY

      return this.volumeConfig.max -
        Math.min( 1, Math.max( 0, ( y / this.$refs.theremin.offsetHeight ) ) ) * this.volumeConfig.diff
    },
    calculateTouch( event ) {
      return {
        x: event.type.match( "mouse" ) ? event.clientX : event.touches[ 0 ].clientX,
        y: event.type.match( "mouse" ) ? event.clientY : event.touches[ 0 ].clientY,
        t: performance.now(),
      }
    },
    resizeCallback() {
      this.$refs.grid.resize()
      this.$refs.tracker.resize()
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
    width 100%
    box-sizing border-box
    flex 1 1 auto

    display flex
    align-items center
    justify-content center

    border 2px solid var(--main-color)
    cursor pointer

  #grid,
  #touch-tracker
    position absolute
    height 100%
    width 100%

</style>
