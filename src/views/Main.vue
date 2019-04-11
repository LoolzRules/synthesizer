<template>
  <div id="main">
    <template v-if="started">
      <synthesizer
          v-if="mode === modes[0]"/>
      <theremin
          v-if="mode === modes[1]"/>
      <div id="settings" :style="{ width: settingsDisplay ? null : '2em' }">
        <div id="toggle">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settingsDisplay">
            <span class="checkmark"></span>
          </label>
        </div>
        <div>
          <label>
            <span class="label">Instrument:</span>
            <select v-model="mode">
              <option v-for="( option, index ) in modes"
                      :key="index"
                      :value="option">
                {{ option }}
              </option>
            </select>
          </label>
          <label>
            <span class="label">Color scheme:</span>
            <select v-model="chosenColorScheme">
              <option v-for="( option, index ) in Object.keys( colorSchemes )"
                      :key="index"
                      :value="option">
                {{ option }}
              </option>
            </select>
          </label>
          <label class="checkbox-label">
            <span class="label">Fullscreen:</span>
            <input type="checkbox" v-model="sMode">
            <span class="checkmark"></span>
          </label>
        </div>
      </div>
      <loading-screen v-if="loading"/>
    </template>
    <start-overlay v-else/>
  </div>
</template>

<script>
import StartOverlay from "../components/StartOverlay"
import LoadingScreen from "../components/LoadingScreen"
import Synthesizer from "../components/Synthesizer"
import Theremin from "../components/Theremin"
import { mapState, } from "vuex"
import Tone from "tone"
import screenfull from "screenfull"
import numToCol from "../utils/numToCol"

export default {
  components: {
    StartOverlay,
    LoadingScreen,
    Synthesizer,
    Theremin,
  },
  data() {
    return {
      mode: null,
      sMode: null,
      loading: null,
      started: null,
      settingsDisplay: null,
      hideTimeout: 1000,
    }
  },
  computed: {
    ...mapState( [
      "modes",
      "colorSchemes",
    ] ),
    chosenColorScheme: {
      get() {
        return this.$store.state.chosenColorScheme
      },
      set( i ) {
        document.documentElement.style.setProperty(
          "--main-color",
          numToCol( this.colorSchemes[ i ][ 0 ] )
        )
        document.documentElement.style.setProperty(
          "--main-bg-color",
          numToCol( this.colorSchemes[ i ][ 1 ] )
        )
        this.$store.commit( "updateColorScheme", i )
      },
    },
  },
  watch: {
    mode() {
      this.showLoadingScreen()
    },
    sMode( isOn ) {
      if ( screenfull.enabled ) {
        if ( isOn ) {
          screenfull.request()
        } else {
          screenfull.exit()
        }
      }
    },
  },
  beforeMount() {
    this.settingsDisplay = true
    this.started = false
    this.chosenColorScheme = Object.keys( this.colorSchemes )[ 0 ]

    const modeChoice = 0
    this.mode = this.modes[ modeChoice ]
    this.sMode = false
  },
  methods: {
    scheduleHideLoadingScreen() {
      setTimeout( this.hideLoadingScreen, this.hideTimeout )
    },
    hideLoadingScreen() {
      this.loading = false
    },
    showLoadingScreen() {
      this.loading = true
    },
    startAudioContext() {
      Tone.context.resume()
      this.started = true
    },
  },
}
</script>

<style lang="stylus">
  #main
    position relative
    height 100vh
    width 100vw
    display flex
    flex-direction column
    justify-content stretch
    font-family var(--font), serif
    color var(--main-color)
    background-color var(--main-bg-color)

  #settings
    position absolute
    bottom 0
    right 0
    box-sizing border-box

    display flex
    flex-direction row
    align-items stretch

    background-color var(--main-bg-color)
    border 2px solid var(--main-color)

    & > #toggle
      padding 0.25em
      flex 0 0 auto
      display flex
      align-items center
      justify-content center

      & > .checkbox-label
        height 100%
        display flex
        align-items center
        justify-content center

        & > .checkmark
          top auto
          left auto
          border none

          &:after
            display block
            left 0.375em
            top 0.25em
            width 0.5em
            height 0.5em
            border solid var(--main-color)
            border-width 0 0.125em 0.125em 0
            transform rotate(135deg)

        & input:checked ~ .checkmark:after
          left 0.125em
          transform rotate(-45deg)

    & > div:not(#toggle)
      padding 0.5em
      flex 1 1 auto

  #info
    box-sizing border-box
    max-height 25%
    min-height 15%
    width 100%
    flex 0 0 auto
    display flex
    flex-direction row
    border 2px solid var(--main-color)
    border-top none

  #controls
    box-sizing border-box
    flex 0 0 auto
    padding .5em
    display flex
    flex-direction column
    justify-content space-around
</style>
