<template>
  <Main></Main>
</template>

<script>
import Main from "./views/Main"

export default {
  name: "App",
  components: {
    Main,
  },
  beforeMount() {
    // Restore saved settings
    for ( let mutation of Object.keys( this.$store._mutations ) ) {
      const value = localStorage.getItem( mutation )
      if ( value ) {
        this.$store.commit( mutation, value )
      }
    }

    // Save new settings
    this.$store.subscribe( ( mutation, state ) => {
      localStorage.setItem( mutation.type, mutation.payload )
    } )
  },
}
</script>

<style lang="stylus">
  :root
    --font "Courier New"

  html,
  body
    height 100vh
    width 100vw
    padding 0
    margin 0
    overflow hidden
    user-select none
    -webkit-tap-highlight-color transparent

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

  a
    color var(--main-color)

    &:visited
      color var(--main-color)

  label
    overflow hidden
    margin 0.125em 0
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

    &.checkbox-label
      position relative
      cursor pointer

      & > .checkmark
        position absolute
        top 0
        right 0
        box-sizing border-box
        height 1.125em
        width 1.125em
        margin 0
        border 1px solid var(--main-color)
        background-color var(--main-bg-color)

        &:after
          content ""
          position absolute
          display none
          left 0.3em
          top 0.1em
          width 0.25em
          height 0.5em
          border solid var(--main-color)
          border-width 0 0.125em 0.125em 0
          transform rotate(45deg)

      & input:checked ~ .checkmark:after
        display block

</style>
