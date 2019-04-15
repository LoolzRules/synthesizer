<template>
  <div id="synthesizer-wrap">
    <div id="synthesizer"
         ref="synthesizer"
         @touchstart="touchStartListener( $event )"
         @touchend="touchEndListener( $event )"
         @touchmove="touchMoveListener( $event )">
      <div v-for="( note, ind ) in currentNotes" :key="ind"
           @mousedown="playNote( ind )"
           @mouseup="stopNote( ind )"
           @mouseleave="mouseLeaveListener( $event, ind )"
           @mouseenter="mouseEnterListener( $event, ind )"
           ref="keys"
           :data-note="note"
           class="key">
          <span>
            {{ note }}
          </span>
      </div>
    </div>
    <div id="info">
      <div id="controls" :style="{ display: displayControls }">
        <label>
          <span class="label">Oscillator type:</span>
          <select v-model="oscillatorType">
            <option v-for="option in oscillatorTypes"
                    :key="option"
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
        <label>
          <span class="label">
            Volume:
            <span class="rangeValue">
              {{ volume }}
            </span>
          </span>
          <input id="volume" type="range"
                 v-model="volume"
                 :min="volumeConfig.min"
                 :max="volumeConfig.max">
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, } from "vuex"
import Tone from "tone"

export default {
  name: "synthesizer",
  data() {
    return {
      synths: null,
      displayControls: null,
      touchedNoteIndices: null,
      keyWidth: null,
      keyHeight: null,
    }
  },
  computed: {
    ...mapState( "synthesizer", [
      "notes",
      "frequencies",
      "keyCodes",
      "keyMap",
      "numberOfMajorNotesInOctave",
      "numberOfNotesInOctave",
      "oscillatorTypes",
      "octaveOffsets",
      "octaveRange",
      "volumeConfig",
    ] ),
    oscillatorType: {
      get() {
        return this.$store.state.synthesizer.oscillatorType
      },
      set( type ) {
        this.$store.commit( "synthesizer/oscillatorType", type )
      },
    },
    octaveOffset: {
      get() {
        return this.$store.state.synthesizer.octaveOffset
      },
      set( offset ) {
        this.$store.commit( "synthesizer/octaveOffset", offset )
      },
    },
    volume: {
      get() {
        return this.$store.state.synthesizer.volume
      },
      set( vol ) {
        this.$store.commit( "synthesizer/volume", vol )
      },
    },
    minIndex() {
      return this.numberOfNotesInOctave * this.octaveOffset
    },
    maxIndex() {
      return this.numberOfNotesInOctave * ( this.octaveOffset + this.octaveRange ) - 1
    },
    currentFrequencies() {
      return this.frequencies.filter( ( el, i ) => i >= this.minIndex && i <= this.maxIndex )
    },
    currentNotes() {
      return this.currentFrequencies.map( ( el, ind ) => {
        return `${this.notes[ ind % this.numberOfNotesInOctave ]}${Math.floor( ( this.minIndex + ind ) / this.numberOfNotesInOctave )}`
      } )
    },
  },
  watch: {
    oscillatorType() {
      this.resetOscillators()
    },
    volume( vol ) {
      Tone.context.master.volume.value = vol
    },
  },
  mounted() {
    const initialChoice = 0
    const initialVolume = 0
    this.oscillatorType = this.oscillatorType
      ? this.oscillatorType
      : this.oscillatorTypes[ initialChoice ]
    this.octaveOffset = this.octaveOffset
      ? this.octaveOffset
      : this.octaveOffsets[ initialChoice ]
    this.volume = this.volume
      ? this.volume
      : initialVolume

    this.touchedNoteIndices = []
    this.keyWidth = this.$refs.synthesizer.offsetWidth / this.numberOfNotesInOctave
    this.keyHeight = this.$refs.synthesizer.offsetHeight / this.octaveRange

    this.synths = new Array( this.currentFrequencies.length ).fill( null )
    this.makeSynths( 0 )

    window.addEventListener( "keydown", this.keyDownListener )
    window.addEventListener( "keyup", this.keyUpListener )
  },
  beforeDestroy() {
    Tone.context.master.volume.value = 0
    this.synths.forEach( synth => {
      synth.dispose()
    } )
    window.removeEventListener( "keydown", this.keyDownListener )
    window.removeEventListener( "keyup", this.keyUpListener )
  },
  methods: {
    keyDownListener( event ) {
      const index = this.keyCodes.indexOf( event.code )
      const NOT_FOUND_INDEX = -1
      if ( index === NOT_FOUND_INDEX ) return

      event.preventDefault()
      if ( event.repeat ) return

      const offset = Math.floor( index / this.numberOfMajorNotesInOctave ) * this.numberOfNotesInOctave
      const newIndex = offset + this.keyMap[ index % this.numberOfMajorNotesInOctave ]
      this.playNote( newIndex )
    },
    keyUpListener( event ) {
      const index = this.keyCodes.indexOf( event.code )
      const NOT_FOUND_INDEX = -1
      if ( index === NOT_FOUND_INDEX ) return

      event.preventDefault()
      const offset = Math.floor( index / this.numberOfMajorNotesInOctave ) * this.numberOfNotesInOctave
      const newIndex = offset + this.keyMap[ index % this.numberOfMajorNotesInOctave ]
      this.stopNote( newIndex )
    },
    mouseEnterListener( event, ind ) {
      const LMB_CODE = 1
      if ( event.buttons === LMB_CODE ) this.playNote( ind )
    },
    mouseLeaveListener( event, ind ) {
      const LMB_CODE = 1
      if ( event.buttons === LMB_CODE ) this.stopNote( ind )
    },
    touchStartListener( event ) {
      let coordinates = []
      for ( let i = 0; i < event.changedTouches.length; i++ ) {
        coordinates.push( {
          x: event.changedTouches[ i ].clientX,
          y: event.changedTouches[ i ].clientY,
        } )
      }

      const noteIndices = coordinates
        .filter( c => this.filterOutsideTouch( c.x, c.y ) )
        .map( c => this.findIndexFromCoordinate( c.x, c.y ) )

      noteIndices.forEach( ind => {
        this.playNote( ind )
      } )
    },
    touchEndListener( event ) {
      let coordinates = []
      for ( let i = 0; i < event.changedTouches.length; i++ ) {
        coordinates.push( {
          x: event.changedTouches[ i ].clientX,
          y: event.changedTouches[ i ].clientY,
        } )
      }

      const noteIndices = coordinates
        .filter( c => this.filterOutsideTouch( c.x, c.y ) )
        .map( c => this.findIndexFromCoordinate( c.x, c.y ) )

      noteIndices.forEach( ind => {
        this.stopNote( ind )
      } )
    },
    touchMoveListener( event ) {
      // event.preventDefault()
      let coordinates = []
      for ( let i = 0; i < event.touches.length; i++ ) {
        coordinates.push( {
          x: event.touches[ i ].clientX,
          y: event.touches[ i ].clientY,
        } )
      }

      const noteIndices = coordinates
        .filter( c => this.filterOutsideTouch( c.x, c.y ) )
        .map( c => this.findIndexFromCoordinate( c.x, c.y ) )

      const toRemove = this.touchedNoteIndices.filter( val => !noteIndices.includes( val ) )
      const toAppend = noteIndices.filter( val => !this.touchedNoteIndices.includes( val ) )
      toRemove.forEach( index => {
        this.stopNote( index )
      } )
      toAppend.forEach( index => {
        this.playNote( index )
      } )
      this.touchedNoteIndices = [
        ...this.touchedNoteIndices.filter( val => noteIndices.includes( val ) ),
        ...toAppend,
      ]
    },
    playNote( index ) {
      this.$refs.keys[ index ].classList.add( "played" )
      this.synths[ index ].triggerAttack( this.$refs.keys[ index ].dataset.note )
    },
    stopNote( index ) {
      this.$refs.keys[ index ].classList.remove( "played" )
      this.synths[ index ].triggerRelease()
    },
    resetOscillators() {
      if ( !this.synths || this.synths.includes( null ) ) return
      this.synths.forEach( ( synth ) => {
        synth.oscillator.set( {
          type: this.oscillatorType,
        } )
      } )
    },
    filterOutsideTouch( cx, cy ) {
      const s = this.$refs.synthesizer
      return cx > s.offsetLeft &&
        cy > s.offsetTop &&
        cx < s.offsetLeft + s.offsetWidth &&
        cy < s.offsetTop + s.offsetHeight
    },
    findIndexFromCoordinate( cx, cy ) {
      const s = this.$refs.synthesizer
      return ( ( ( s.offsetLeft + cx ) / this.keyWidth ) | 0 ) +
        ( ( ( s.offsetTop + cy ) / this.keyHeight ) | 0 ) * this.numberOfNotesInOctave
    },
    makeSynths( ind ) {
      if ( ind < this.synths.length ) {
        this.synths[ ind ] = new Tone.Synth( {
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
        window.requestAnimationFrame( () => this.makeSynths( ind + 1 ) )
      } else {
        this.$parent.scheduleHideLoadingScreen()
      }
    },
  },
}
</script>

<style lang="stylus">
  #synthesizer-wrap
    height 100%
    width 100%
    display flex
    flex-direction column

  #synthesizer
    box-sizing border-box
    height 100%
    width 100%
    flex 1 1 auto

    display flex
    flex-wrap wrap

    border 1px solid var(--main-color)
    cursor pointer

    & > .key
      box-sizing border-box
      height 25%
      width 8.3333%
      flex 1 1 auto

      display flex
      align-items center
      justify-content center

      border 1px solid var(--main-color)
      font-size 1.25em
      font-weight bold

      color var(--main-color)
      background-color var(--main-bg-color)

      transition color 0.5s ease 0s, background-color 0.5s ease 0s

      &.played
        color var(--main-bg-color)
        background-color var(--main-color)

</style>
