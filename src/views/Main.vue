<template>
  <div id="main">
    <template v-if="started">
      <synthesizer
          v-if="mode === modes[0]"/>
      <theremin
          v-if="mode === modes[1]"/>
      <looper
          v-if="mode === modes[2]"/>
      <div id="settings" :class="{ hidden: !settingsDisplay }">
        <div id="toggle">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settingsDisplay">
            <span class="checkmark"></span>
          </label>
        </div>
        <div id="hide-me">
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
            <select v-model="colorScheme">
              <option v-for="( option, index ) in Object.keys( colorSchemes )"
                      :key="index"
                      :value="option">
                {{ option }}
              </option>
            </select>
          </label>
          <label class="checkbox-label">
            <span class="label">Fullscreen:</span>
            <input type="checkbox" v-model="fullscreenMode">
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
import Looper from "../components/Looper"
import { mapState, } from "vuex"
import Tone from "tone"
import screenfull from "screenfull"

export default {
  components: {
    StartOverlay,
    LoadingScreen,
    Synthesizer,
    Theremin,
    Looper,
  },
  data() {
    return {
      fullscreenMode: null,
      loading: null,
      started: null,
      settingsDisplay: null,
      hideTimeout: 1000,
    }
  },
  computed: {
    ...mapState( "app", [
      "modes",
      "colorSchemes",
    ] ),
    colorScheme: {
      get() {
        return this.$store.state.app.colorScheme
      },
      set( i ) {
        this.$store.commit( "app/colorScheme", i )
      },
    },
    mode: {
      get() {
        return this.$store.state.app.mode
      },
      set( mode ) {
        this.$store.commit( "app/mode", mode )
      },
    },
  },
  watch: {
    mode() {
      this.showLoadingScreen()
    },
    fullscreenMode( isOn ) {
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

    this.colorScheme = this.colorScheme
      ? this.colorScheme
      : Object.keys( this.colorSchemes )[ 0 ]
    this.mode = this.mode
      ? this.mode
      : this.modes[ 0 ]

    this.fullscreenMode = false
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
      this.showLoadingScreen()
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
    z-index 998
    box-sizing border-box

    display flex
    flex-direction row
    align-items stretch

    background-color var(--main-bg-color)
    border 2px solid var(--main-color)

    width 20em
    transition width 0.25s ease 0s

    &.hidden
      width 2em

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
            content "◄"

        & input:checked ~ .checkmark:after
          content "►"

    & > #hide-me
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
