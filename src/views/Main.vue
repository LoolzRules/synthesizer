<template>
  <div id="main">
    <synthesizer
        v-if="mode === modes[0]"
        :ctx="ctx"/>
    <theremin
        v-if="mode === modes[1]"
        :audioCtx="ctx"/>
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
    </div>
  </div>
</template>

<script>
import {
  mapState,
} from "vuex"
import Synthesizer from "../components/Synthesizer"
import Theremin from "../components/Theremin"

export default {
  components: {
    Synthesizer,
    Theremin,
  },
  data() {
    return {
      ctx: null,
      mode: null,
    }
  },
  beforeMount() {
    this.ctx = new AudioContext()

    const modeChoice = 0
    this.mode = this.modes[ modeChoice ]
  },
  computed: {
    ...mapState( [
      "modes",
    ] ),
  },
}
</script>

<style lang="stylus">
  mbg = 0, 0, 0
  m = 0, 255, 0

  :root
    --main-bg-rgb mbg
    --main-rgb m
    --main-bg-color rgb( mbg )
    --main-color rgb( m )

  #main
    height 100vh
    width 100vw
    display flex
    flex-direction column
    justify-content stretch
    font-family Courier, serif
    color var(--main-color)
    background-color var(--main-bg-color)

  #mode
    position absolute
    top 0
    right 0
    padding 4px
    box-sizing border-box
    background-color var(--main-bg-color)
    border 2px solid var(--main-color)

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
      margin-top (trackHeight/2 - size/2 - unit(borderWidth / 16, em))

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

</style>
