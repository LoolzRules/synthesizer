<template>
  <div id="looper-wrap">
    <div id="looper">
      <matrix-rain id="matrix-rain" ref="rain"/>
      <div id="overlay"
           :style="{ opacity: opacity/100 }">
      </div>
      <div class="tracks">
        <div v-for="( synth, si ) in this.poly" :key="si"
             class="track">
          <div v-for="( beat, bi ) in beats[si]" :key="bi"
               @click="$set(beats[si], bi, !beat)"
               class="beat" :class="{ active: beat }">
          </div>
          <div class="track-controls">
            <label>
              <select v-model="synthNotes[si].note">
                <option v-for="( option, index ) in notes"
                        :key="index"
                        :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
            <label>
              <select v-model="synthNotes[si].octave">
                <option v-for="( option, index ) in octaves"
                        :key="index"
                        :value="option">
                  {{ option }}
                </option>
              </select>
            </label>
          </div>
        </div>
        <div class="buttons">
          <input type="button" value="+"
                 @click="addTrack"/>
          <input type="button" value="►"
                 @click="play"/>
          <input type="button" value="■"
                 @click="stop"/>
        </div>
      </div>
    </div>
    <div id="info">
      <div id="controls">
        <label>
          <span class="label">
            Tempo:
            <span class="rangeValue">
              {{ tempo }}
            </span>
          </span>
          <input id="tempo" type="range"
                 v-model="tempo"
                 :min="tempoConfig.min"
                 :max="tempoConfig.max">
        </label>
        <label>
          <span class="label">
            BG opacity:
            <span class="rangeValue">
              {{ (opacity/(opacityConfig.max - opacityConfig.min)).toFixed(2) }}
            </span>
          </span>
          <input id="opacity" type="range"
                 v-model="opacity"
                 :min="opacityConfig.min"
                 :max="opacityConfig.max">
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import MatrixRain from "./MatrixRain"
import { mapState, } from "vuex"
import Tone from "tone"

export default {
  name: "looper",
  components: {
    MatrixRain,
  },
  data() {
    return {
      poly: [],
      beats: [],
      synthNotes: [],
      beatsInTrack: 16,
      tempo: null,
      tempoConfig: {
        max: 180,
        min: 60,
      },
      noteDuration: "4n",
    }
  },
  computed: {
    ...mapState( "looper", [
      "notes",
      "octaves",
      "opacityConfig",
    ] ),
    opacity: {
      get() {
        return this.$store.state.looper.bgOpacity
      },
      set( opacity ) {
        this.$store.commit( "looper/bgOpacity", opacity )
      },
    },
  },
  watch: {
    tempo() {
      Tone.Transport.bpm.value = this.tempo
    },
  },
  mounted() {
    this.tempo = Tone.Transport.bpm.value

    const initialOpacity = 100
    this.opacity = this.opacity
      ? this.opacity
      : initialOpacity

    this.addTrack()
    this.$parent.scheduleHideLoadingScreen()

    window.addEventListener( "resize", this.resizeCallback, true )
  },
  beforeDestroy() {
    window.removeEventListener( "resize", this.resizeCallback, true )
  },
  methods: {
    play() {
      if ( Tone.Transport.state === "started" ) {
        this.stop()
      }
      const notes = this.synthNotes.map( note => `${note.note}${note.octave}` )
      this.poly.forEach( ( synth, ind ) => {
        this.beats[ ind ].forEach( ( beat, i ) => {
          if ( beat ) {
            Tone.Transport.schedule( ( time ) => {
              synth.triggerAttackRelease( notes[ ind ], Tone.Time( this.noteDuration ), time )
            }, i * Tone.Time( this.noteDuration ) )
          }
        } )
      } )
      Tone.Transport.start()
    },
    stop() {
      Tone.Transport.stop()
      Tone.Transport.cancel()
    },
    addTrack() {
      this.poly.push( new Tone.Synth( {
        oscillator: {
          type: "sine",
        },
        envelope: {
          attack: 0.005,
          decay: 0,
          sustain: 0,
          release: 0.05,
        },
      } ).toMaster() )
      this.beats.push( new Array( this.beatsInTrack ).fill( false ) )

      const initialChoice = 0
      this.synthNotes.push( {
        note: this.notes[ initialChoice ],
        octave: this.octaves[ initialChoice ],
      } )
    },
    resizeCallback() {
      this.$refs.rain.resize()
    },
  },
}
</script>

<style lang="stylus">
  #looper-wrap
    flex 1 1 auto
    width 100%
    display flex
    flex-direction column
    justify-content stretch

  #looper
    position relative
    width 100%
    box-sizing border-box
    flex 1 1 auto

    display flex
    flex-direction column
    align-items center
    justify-content center

    border 2px solid var(--main-color)

    .tracks
      z-index 1
      display flex
      flex-direction column
      align-items flex-start
      justify-content flex-start

      & > .buttons
        width 100%
        display flex
        align-items center
        justify-content center

      & > .track
        display flex

        & > .beat
          width 2em
          height 2em
          margin 0.125em
          background-color var(--main-bg-color)
          border 1px solid var(--main-color)
          cursor pointer

          &.active
            background-color var(--main-color)

        & > .track-controls
          display flex
          align-items center
          justify-content stretch

  #matrix-rain,
  #overlay
    position absolute
    height 100%
    width 100%

  #overlay
    background-color var(--main-bg-color)

</style>
