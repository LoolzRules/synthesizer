<template>
  <div id="main">
    <template v-if="started">
      <synthesizer
          v-if="mode === modes[0]"/>
      <theremin
          v-if="mode === modes[1]"/>
      <div id="mode">
        <label>
          <span class="label">Choose instrument:</span>
          <select v-model="mode">
            <option v-for="( option, index ) in modes"
                    :key="index"
                    :value="option">
              {{ option }}
            </option>
          </select>
        </label>
        <!--TODO: better fullscreen toggle-->
        <label>
          <span class="label">Fullscreen:</span>
          <select v-model="sMode">
            <option v-for="( option, index ) in sModes"
                    :key="index"
                    :value="!!index">
              {{ option }}
            </option>
          </select>
        </label>
      </div>
      <loading-screen id="loading-screen" v-if="loading"/>
    </template>
    <div v-else id="start-overlay">
      <span class="overButton">{{finalMessage}}</span>
      <input type="button" value="start"
             @click="startAudioContext"/>
      <span class="underButton">
        On smaller devices landscape fullscreen is advised
        <br>
        By pressing START button you accept <a href="https://bit.ly/loolzToS">Terms of Service</a>
      </span>
    </div>
  </div>
</template>

<script>
import { mapState, } from "vuex"
import LoadingScreen from "../components/LoadingScreen"
import Synthesizer from "../components/Synthesizer"
import Theremin from "../components/Theremin"
import Tone from "tone"
import screenfull from "screenfull"

export default {
  components: {
    LoadingScreen,
    Synthesizer,
    Theremin,
  },
  data() {
    return {
      message: null,
      prevTime: -Infinity,
      typeDelay: 50,
      finalMessage: null,
      mode: null,
      sMode: null,
      sModes: [ "off", "on", ],
      loading: null,
      started: null,
      initTimeout: 1000,
    }
  },
  computed: {
    ...mapState( [
      "modes",
    ] ),
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
    this.started = false

    const modeChoice = 0
    this.mode = this.modes[ modeChoice ]
    this.sMode = false
  },
  mounted() {
    this.message = "Hello, my name is Loolz\nWelcome to my music app"
    this.finalMessage = ""
    this.typeLetter( this.prevTime, 0 )
  },
  methods: {
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
    typeLetter( time, ind ) {
      if ( ind >= this.message.length ) return

      if ( time > this.prevTime + this.typeDelay ) {
        this.finalMessage += this.message.charAt( ind )
        this.prevTime = time
        window.requestAnimationFrame( ( t ) => {
          this.typeLetter( t, ind + 1 )
        } )
      } else {
        window.requestAnimationFrame( ( t ) => {
          this.typeLetter( t, ind )
        } )
      }
    },
  },
}
</script>

<style lang="stylus">
  mbg = 0, 0, 0
  m = 0, 255, 0

  :root
    --main-bg-rgb mbg
    --main-rgb m
    --main-bg-color rgb(mbg)
    --main-color rgb(m)
    --font "Courier New"

  input[type=range]
    trackHeight = .5em
    borderRadius = 1.375em
    size = 1.375em
    borderWidth = 2px

    -webkit-appearance none
    margin 0

    &::-webkit-slider-runnable-track
      width 100%
      height trackHeight
      cursor pointer
      background var(--main-color)
      border-radius 0
      border borderWidth solid var(--main-bg-color)

    &::-webkit-slider-thumb
      border borderWidth solid var(--main-bg-color)
      height size
      width size
      border-radius borderRadius
      background var(--main-color)
      cursor pointer
      -webkit-appearance none
      margin-top (trackHeight/ 2 - size/ 2 - unit(borderWidth / 16, em))

    &::-moz-range-track
      width 100%
      height trackHeight
      cursor pointer
      background var(--main-color)
      border-radius 0
      border borderWidth solid var(--main-bg-color)

    &::-moz-range-thumb
      height size
      width size
      background var(--main-color)
      border-radius borderRadius
      border borderWidth solid var(--main-bg-color)
      cursor pointer

    &::-ms-track
      width 100%
      height trackHeight
      cursor pointer
      background transparent
      border-color transparent
      color transparent

    &::-ms-fill-lower
      background var(--main-color)
      border borderWidth solid var(--main-bg-color)
      border-radius 0

    &::-ms-fill-upper
      background var(--main-color)
      border borderWidth solid var(--main-bg-color)
      border-radius 0

    &::-ms-thumb
      border borderWidth solid var(--main-bg-color)
      height size
      width size
      border-radius borderRadius
      background var(--main-color)
      cursor pointer

    &:focus
      outline none

      &::-webkit-slider-runnable-track
        background var(--main-color)

      &::-ms-fill-lower
        background var(--main-color)

      &::-ms-fill-upper
        background var(--main-color)

  input[type=button]
    padding 0.5em
    font inherit
    color var(--main-color)
    outline none
    border 1px solid var(--main-color)
    background-color var(--main-bg-color)
    cursor pointer

  label
    overflow hidden
    margin 2px 0
    display flex
    flex-direction row
    justify-content space-between
    align-items center

    & > span
      margin-right 1em

    & > select
      box-sizing border-box
      color var(--main-color)
      background-color var(--main-bg-color)
      border 1px solid var(--main-color)
      outline none

      & > option:hover
        color var(--main-bg-color)
        background-color var(--main-color)

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

  #mode
    position absolute
    bottom 0
    right 0
    padding 0.5em
    box-sizing border-box
    background-color var(--main-bg-color)
    border 2px solid var(--main-color)

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

  #loading-screen
    position absolute
    top 50vh
    left 50vw
    margin-top -50vh
    margin-left -50vw

    height 100vh
    width 100vw

    display flex
    align-items center
    justify-content center
    background-color var(--main-bg-color)

    & > span
      font-size 2em
      font-weight bold

  #start-overlay
    position absolute
    box-sizing border-box
    height 100%
    width 100%
    padding 1em
    display flex
    flex-direction column
    align-items center
    justify-content space-around
    background-color var(--main-bg-color)

    & > .overButton
      height 3em
      font-size 1.25em
      font-weight bold
      line-height 1.5em
      text-align center
      white-space pre-wrap

    & > .underButton
      font-size 1em
      line-height 1.5em
      text-align center

    & > input[type=button]
      font-size 2em
      font-weight bold
      text-transform uppercase

</style>
