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
    this.$store.subscribe( ( mutation ) => {
      localStorage.setItem( mutation.type, mutation.payload )
    } )
  },
}
</script>

<style lang="stylus">
  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed,
  figure, figcaption, footer, header, hgroup,
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video, input, select, option
    margin 0
    padding 0
    border 0
    font inherit
    font-size 100%
    vertical-align baseline

  article, aside, details,
  figcaption, figure, footer, header,
  hgroup, menu, nav, section
    display block

  body
    line-height 1

  ol, ul
    list-style none

  blockquote, q
    quotes none

  blockquote:before, blockquote:after, q:before, q:after
    content ""
    content none

  table
    border-collapse collapse
    border-spacing 0

  // My styles
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
    borderWidth = 0.0625em
    thumbBorderWidth = 2 * borderWidth

    -webkit-appearance none
    margin 0
    height size
    background none

    &::-webkit-slider-runnable-track
      width 100%
      height trackHeight
      cursor pointer
      background var(--main-bg-color)
      border-radius 0
      border borderWidth solid var(--main-color)

    &::-webkit-slider-thumb
      border thumbBorderWidth solid var(--main-color)
      height size
      width size
      border-radius borderRadius
      background var(--main-bg-color)
      cursor pointer
      -webkit-appearance none
      margin-top (trackHeight/ 2 - size/ 2 - borderWidth)

    &::-moz-range-track
      width 100%
      height trackHeight
      cursor pointer
      background var(--main-bg-color)
      border-radius 0
      border borderWidth solid var(--main-color)

    &::-moz-range-thumb
      height size
      width size
      background var(--main-bg-color)
      border-radius borderRadius
      border thumbBorderWidth solid var(--main-color)
      cursor pointer

    &::-ms-track
      width 100%
      height trackHeight
      cursor pointer
      background transparent
      border-color transparent
      color transparent

    &::-ms-fill-lower
      background var(--main-bg-color)
      border borderWidth solid var(--main-color)
      border-radius 0

    &::-ms-fill-upper
      background var(--main-bg-color)
      border borderWidth solid var(--main-color)
      border-radius 0

    &::-ms-thumb
      border thumbBorderWidth solid var(--main-color)
      height size
      width size
      border-radius borderRadius
      background var(--main-bg-color)
      cursor pointer

    &:focus
      outline none

      &::-webkit-slider-runnable-track
        background var(--main-bg-color)

      &::-ms-fill-lower
        background var(--main-bg-color)

      &::-ms-fill-upper
        background var(--main-bg-color)

    &:active
      &::-webkit-slider-thumb
        background var(--main-color)

      &::-moz-range-thumb
        background var(--main-color)

      &::-ms-thumb
        background var(--main-color)

  input[type=button]
    display flex
    align-items center
    justify-content center
    padding 0.375em 0.5em
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

    & > span.label
      margin-right 1em

      & > span.rangeValue
        display inline-block
        text-align center
        min-width 3em

    & > select
      box-sizing border-box
      font-family var(--font)
      font-size 100%
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

      input[type=checkbox]
        display none

      & > .checkmark
        box-sizing border-box
        height 1.375em
        width 1.375em
        margin 0

        display flex
        align-items center
        justify-content center

        border 1px solid var(--main-color)
        background-color var(--main-bg-color)

        &:after
          content "✔"
          display none

      & input:checked ~ .checkmark:after
        display block

</style>
