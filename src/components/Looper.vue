<template>
  <div id="looper-wrap">
    <div id="looper">
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
      </div>
    </div>
    <div id="info">
      <div id="controls">
        <label>
          <span class="label">Tempo: {{ tempo }}</span>
          <input id="volume" type="range"
                 v-model="tempo"
                 :min="tempoConfig.min"
                 :max="tempoConfig.max">
        </label>
        <div>
          <input type="button" value="add track"
                 @click="addTrack"/>
          <input type="button" value="play"
                 @click="play"/>
          <input type="button" value="stop"
                 @click="stop"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, } from "vuex"
import Tone from "tone"

export default {
  name: "looper",
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
    }
  },
  computed: {
    ...mapState( "looper", [
      "notes",
      "octaves",
    ] ),
  },
  watch: {
    tempo() {
      Tone.Transport.bpm.value = this.tempo
    },
  },
  mounted() {
    this.tempo = Tone.Transport.bpm.value
    this.addTrack()
    this.$parent.scheduleHideLoadingScreen()
  },
  methods: {
    play() {
      const notes = this.synthNotes.map( note => `${note.note}${note.octave}` )
      this.poly.forEach( ( synth, ind ) => {
        this.beats[ ind ].forEach( ( beat, i ) => {
          if ( beat ) {
            Tone.Transport.schedule( ( time ) => {
              console.log( time )
              synth.triggerAttackRelease( notes[ ind ], Tone.Time( "4n" ), time )
            }, i * Tone.Time( "4n" ) )
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
    cursor pointer

    .tracks
      display flex
      flex-direction column
      align-items flex-start
      justify-content flex-start

      & > .track
        display flex

        & > .beat
          width 2em
          height 2em
          margin 0.125em
          border 1px solid var(--main-color)

          &.active
            background-color var(--main-color)

        & > .track-controls
          display flex
          align-items center
          justify-content stretch

</style>
