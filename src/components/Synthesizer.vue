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
          <span class="label">Volume: {{ volumeConfig.curr }}</span>
          <input id="volume" type="range"
                 v-model="volumeConfig.curr"
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
      oscillatorType: null,
      octaveOffset: null,
      displayControls: null,
      touchedNoteIndices: null,
      keyWidth: null,
      keyHeight: null,
      volumeConfig: {
        max: 20,
        min: -30,
        curr: 0,
      },
    }
  },
  computed: {
    ...mapState( [
      "notes",
      "frequencies",
      "keys",
      "keyMap",
      "numberOfMajorNotesInOctave",
      "numberOfNotesInOctave",
      "oscillatorTypes",
      "octaveOffsets",
    ] ),
    minIndex() {
      return this.numberOfNotesInOctave * this.octaveOffset
    },
    maxIndex() {
      return this.numberOfNotesInOctave * ( this.octaveOffset + this.keys.length / this.numberOfMajorNotesInOctave ) - 1
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
    volumeConfig: {
      handler( vol ) {
        Tone.context.master.volume.value = vol.curr
      },
      deep: true,
    },
  },
  mounted() {
    const initialChoice = 0
    this.oscillatorType = this.oscillatorTypes[ initialChoice ]
    this.octaveOffset = this.octaveOffsets[ initialChoice ]

    this.touchedNoteIndices = []
    this.keyWidth = this.$refs.synthesizer.offsetWidth / this.numberOfNotesInOctave
    this.keyHeight = this.$refs.synthesizer.offsetHeight / ( this.keys.length / this.numberOfMajorNotesInOctave )

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
      const index = this.keys.indexOf( event.key )
      const NOT_FOUND_INDEX = -1
      if ( index === NOT_FOUND_INDEX ) return

      event.preventDefault()
      if ( event.repeat ) return

      const offset = Math.floor( index / this.numberOfMajorNotesInOctave ) * this.numberOfNotesInOctave
      const newIndex = offset + this.keyMap[ index % this.numberOfMajorNotesInOctave ]
      this.playNote( newIndex )
    },
    keyUpListener( event ) {
      const index = this.keys.indexOf( event.key )
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
      this.synths[ index ].triggerAttack( this.$refs.keys[ index ].dataset.note, "+0.05" )
    },
    stopNote( index ) {
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
        setTimeout( this.$parent.hideLoadingScreen, this.$parent.initTimeout )
      }
    },
    switchControls() {
      console.log( this.displayControls )
      this.displayControls = this.displayControls ? null : "none"
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
    width 100%
    box-sizing border-box
    flex 1 1 auto

    display flex
    flex-wrap wrap

    border 1px solid var(--main-color)
    cursor pointer

    & > .key
      height 25%
      width 8.3333%
      flex 1 1 auto
      box-sizing border-box

      display flex
      align-items center
      justify-content center

      border 1px solid var(--main-color)
      font-size 1.25em
      font-weight bold

  #lastPlayed
    box-sizing border-box
    flex 1 1 auto
    padding .5em
    overflow auto

</style>
