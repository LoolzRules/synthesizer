<template>
  <div id="synthesizer-wrap">
    <div id="synthesizer">
      <div v-for="( freq, ind ) in currentFrequencies" :key="ind"
           @click="clickNote( ind )"
           ref="keys"
           :data-note="currentNotes[ind]"
           :data-frequency="freq"
           class="key">
          <span>
            {{ currentNotes[ind] }}
          </span>
      </div>
    </div>
    <div id="info">
      <div id="controls" :style="{ display: displayControls }">
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
          <span class="label">Volume: {{ gain.value }}</span>
          <input id="volume" type="range"
                 v-model="gain.value"
                 :min="gain.min"
                 :max="gain.max">
        </label>
      </div>
      <span id="lastPlayed" @click="switchControls">
        {{ lastPlayed.length === 0 ? "Last played notes are displayed here" : lastPlayed.join(" ") }}
      </span>
    </div>
  </div>
</template>

<script>
import {
  mapState,
} from "vuex"

export default {
  name: "synthesizer",
  props: [
    "ctx",
  ],
  data() {
    return {
      keyBindings: {},
      octaveOffset: 3,
      gain: {
        value: 75,
        min: 0,
        max: 100,
      },
      oscillatorType: null,
      lastPlayed: [],
      displayControls: null,
    }
  },
  mounted() {
    const firstChoice = 0
    this.oscillatorType = this.oscillatorTypes[ firstChoice ]

    window.addEventListener( "keydown", this.keyEventListener )
  },
  beforeDestroy() {
    window.removeEventListener( "keydown", this.keyEventListener )
  },
  methods: {
    keyEventListener( event ) {
      let index = this.keys.indexOf( event.key )
      const NOT_FOUND_INDEX = -1

      if ( index !== NOT_FOUND_INDEX ) {
        event.preventDefault()
        const offset = Math.floor( index / this.numberOfMajorNotesInOctave ) * this.numberOfNotesInOctave
        const newIndex = offset + this.keyMap[ index % this.numberOfMajorNotesInOctave ]
        this.clickNote( newIndex )
      }
    },
    clickNote( index ) {
      const key = this.$refs.keys[ index ]
      this.lastPlayed.push( key.dataset.note )
      this.playSound( key.dataset.frequency )
    },
    playSound( frequency ) {
      const o = this.ctx.createOscillator()
      const g = this.ctx.createGain()

      o.type = this.oscillatorType
      o.frequency.value = frequency
      g.gain.value = this.gain.value / this.gain.max

      o.connect( g )
      g.connect( this.ctx.destination )

      const endDelay = 1
      const finalValue = 0.00001
      o.start()
      g.gain.exponentialRampToValueAtTime(
        finalValue, this.ctx.currentTime + endDelay
      )
    },
    switchControls() {
      console.log( this.displayControls )
      this.displayControls = this.displayControls ? null : "none"
    },
  },
  computed: {
    ...mapState( [
      "notes",
      "frequencies",
      "keys",
      "keyMap",
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
    currentFrequencies() {
      return this.frequencies.filter( ( el, i ) => i >= this.minIndex && i < this.maxIndex )
    },
    currentNotes() {
      return this.currentFrequencies.map( ( el, ind ) => {
        return `${this.notes[ ind % this.numberOfNotesInOctave ]}${Math.floor( ( this.minIndex + ind ) / this.numberOfNotesInOctave )}`
      } )
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
    height 75%
    width 100%
    box-sizing border-box
    flex 1 1 auto
    display flex
    flex-wrap wrap
    border 1px solid var(--main-color)

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
      user-select none
      cursor pointer

  #lastPlayed
    box-sizing border-box
    flex 1 1 auto
    padding .5em
    overflow auto

</style>
