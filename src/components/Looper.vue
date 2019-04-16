<template>
  <div id="looper-wrap">
    <div id="looper">
      <matrix-rain id="matrix-rain" ref="rain"/>
      <div id="overlay"
           :style="{ opacity: opacity/100 }">
      </div>
      <div class="tracks-wrap">
        <div class="tracks">
          <div v-for="( synth, si ) in this.poly" :key="si"
               class="track">
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
              <input type="button" value="✖"
                     @click="deleteTrack(si)"/>
            </div>
            <div class="beats">
              <div v-for="( beat, bi ) in beats[si]" :key="bi"
                   @click="setBeat( si, bi, !beat )"
                   class="beat" :class="{ active: beat, unavailable: loopConfig.isPlaying }">
              </div>
            </div>
          </div>
          <div class="progress-wrap">
          <span class="label">
            Position:
          </span>
            <div class="progress" :style="{ background: trackConfig.background }">
            </div>
          </div>
          <div class="buttons">
            <input type="button" :value="loopConfig.isPlaying ? '❚❚' : '►' "
                   @click="playOrPause"/>
            <input type="button" value="■"
                   :style="{ opacity: loopConfig.isPlaying || loopConfig.isPaused ? 1 : 0.5 }"
                   @click="stop"/>
            <input type="button" value="↺"
                   :style="{ opacity: isLooping ? 1 : 0.5 }"
                   @click="toggleLooping"/>
            <input type="button" value="+"
                   @click="addTrack"/>
          </div>
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
import numToCol from "../utils/numToCol"
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
      noteDuration: "4n",
      trackConfig: {
        minPercent: 1,
        maxPercent: 99,
        background: null,
        animationID: null,
      },
      loopConfig: {
        duration: "4m",
        tickDuration: null,
        isPlaying: null,
        isPaused: null,
      },
      isLooping: null,
    }
  },
  computed: {
    ...mapState( "app", [
      "colorSchemes",
      "colorScheme",
    ] ),
    ...mapState( "looper", [
      "notes",
      "octaves",
      "opacityConfig",
      "tempoConfig",
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
    tempo( val ) {
      Tone.Transport.bpm.value = val
    },
    isLooping( val ) {
      Tone.Transport.loop = val
    },
  },
  mounted() {
    this.tempo = Tone.Transport.bpm.value
    this.isLooping = Tone.Transport.loop
    Tone.Transport.setLoopPoints( 0, this.loopConfig.duration )
    this.loopConfig.tickDuration = Tone.Transport.toTicks( this.loopConfig.duration )

    const initialOpacity = 100
    this.opacity = this.opacity
      ? this.opacity
      : initialOpacity

    this.addTrack()
    this.$parent.scheduleHideLoadingScreen()

    this.updateProgressBackground()

    window.addEventListener( "resize", this.resizeCallback, true )
  },
  beforeDestroy() {
    Tone.Transport.loop = false
    this.stop()
    window.removeEventListener( "resize", this.resizeCallback, true )
    window.cancelAnimationFrame( this.trackConfig.animationID )
  },
  methods: {
    playOrPause() {
      if ( Tone.Transport.state === "started" ) {
        this.loopConfig.isPlaying = false
        this.loopConfig.isPaused = true

        Tone.Transport.pause()
        Tone.Transport.cancel()
        return
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

      if ( !this.isLooping ) {
        Tone.Transport.schedule( _ => {
          this.stop()
        }, this.loopConfig.duration )
      }

      this.loopConfig.isPlaying = true
      this.loopConfig.isPaused = false
      Tone.Transport.start()
    },
    stop() {
      this.loopConfig.isPlaying = false
      this.loopConfig.isPaused = false
      Tone.Transport.stop()
      Tone.Transport.cancel()
    },
    toggleLooping() {
      this.isLooping = !this.isLooping
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
    deleteTrack( index ) {
      this.poly.splice( index, 1 )
      this.beats.splice( index, 1 )
      this.synthNotes.splice( index, 1 )
    },
    setBeat( si, bi, val ) {
      if ( !this.loopConfig.isPlaying ) {
        this.$set( this.beats[ si ], bi, val )
      }
    },
    resizeCallback() {
      this.$refs.rain.resize()
    },
    updateProgressBackground() {
      const percentRange = this.trackConfig.maxPercent - this.trackConfig.minPercent
      const progress = ( ( Tone.Transport.ticks * percentRange / this.loopConfig.tickDuration ) | 0 ) + this.trackConfig.minPercent
      const color = numToCol( this.colorSchemes[ this.colorScheme ][ 0 ] )

      this.trackConfig.background = `linear-gradient(90deg, ${color} ${this.trackConfig.minPercent}%, transparent ${this.trackConfig.minPercent}%,
        transparent ${progress}%, ${color} ${progress}%,
        ${color} ${progress + 1}%, transparent ${progress + 1}%,
        transparent ${this.trackConfig.maxPercent}%, ${color} ${this.trackConfig.maxPercent}% )`.replace( /\n\s+/g, " " )

      this.trackConfig.animationID = window.requestAnimationFrame( this.updateProgressBackground )
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
    min-width 100%
    box-sizing border-box
    flex 1 1 auto

    display flex
    overflow hidden

    border 2px solid var(--main-color)

    .tracks-wrap
      width 100%
      height 100%
      display flex
      flex-direction column
      align-items center
      justify-content center
      flex-wrap wrap
      overflow-x auto

      -ms-overflow-style none
      overflow -moz-scrollbars-none

      &::-webkit-scrollbar
        display none

      & > .tracks
        z-index 1
        padding 0.5em
        max-width 35em
        overflow-y auto

        -ms-overflow-style none
        overflow -moz-scrollbars-none

        &::-webkit-scrollbar
          display none

        & > .buttons
          width 100%
          display flex
          align-items center
          justify-content center
          font-size 1.5em
          font-weight bold

          & > input[type=button]
            height 2em
            width 2em
            margin 0.125em
            padding-top 0.45em

        & > .progress-wrap
          width 100%
          height 1em
          display flex

          & > .label
            width 7em

          & > .progress
            flex 1 1 auto

        & > .track
          width 100%
          display flex

          & > .beats
            flex 1 1 auto
            display flex
            align-items stretch
            justify-content space-between
            padding 0.125em 0
            width 28em

            & > .beat
              box-sizing border-box
              width 1.5em
              height 1.5em
              background-color var(--main-bg-color)
              border 1px solid var(--main-color)
              cursor pointer

              &.active
                background-color var(--main-color)

              &.unavailable
                opacity 0.75

          & > .track-controls
            width 7em
            flex 0 0 auto
            display flex
            align-items center
            justify-content stretch

            & > input[type=button]
              padding 0.125em 0.2em

  #matrix-rain,
  #overlay
    position absolute
    height 100%
    width 100%

  #overlay
    background-color var(--main-bg-color)

</style>
