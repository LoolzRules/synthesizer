<template>
  <div id="start-overlay">
      <span class="overButton">
        <span class="non-blink">{{finalMessage}}</span>
        <span class="blink" ref="blinker">|</span>
      </span>
    <input type="button" value="start"
           @click="$parent.startAudioContext"/>
    <span class="underButton">
        On smaller devices landscape fullscreen is advised
      </span>
    <span class="underButton">
        By pressing START button you accept <a href="https://bit.ly/loolzToS">Terms of Service</a>
      </span>
  </div>
</template>

<script>
export default {
  name: "start-overlay",
  data() {
    return {
      finalMessage: null,
      blinkDelay: 1000,
      blinkRepeat: 3,
      blinkTimeoutID: null,
      message: null,
      prevTime: -Infinity,
      typeDelay: 50,
      typeDivisorDelay: 200,
    }
  },
  mounted() {
    this.message = "Hello, my name is Loolz\nWelcome to my music app"
    this.finalMessage = ""
    this.blinkTimeoutID = setTimeout( () => {
      this.$refs.blinker.classList.remove( "blink" )
      this.typeLetter( this.prevTime, 0 )
    }, this.blinkDelay * this.blinkRepeat )
  },
  beforeDestroy() {
    clearTimeout( this.blinkTimeoutID )
  },
  methods: {
    typeLetter( time, ind ) {
      if ( ind >= this.message.length ) return

      const delay = this.message.charAt( ind ) !== "\n"
        ? this.typeDelay
        : this.typeDivisorDelay

      if ( time <= this.prevTime + delay ) {
        window.requestAnimationFrame( ( t ) => {
          this.typeLetter( t, ind )
        } )
        return
      }

      this.finalMessage += this.message.charAt( ind )

      if ( ind === this.message.length - 1 || this.message.charAt( ind + 1 ) === "\n" ) {
        this.$refs.blinker.style.display = "none"
      } else {
        this.$refs.blinker.style.display = "inline"
      }

      this.prevTime = time

      window.requestAnimationFrame( ( t ) => {
        this.typeLetter( t, ind + 1 )
      } )
    },
  },
}
</script>

<style lang="stylus">
  #start-overlay
    position absolute
    box-sizing border-box
    height 100%
    width 100%
    padding 1em
    display flex
    flex-direction column
    align-items center
    justify-content center
    background-color var(--main-bg-color)

    & > .overButton
      padding 0 0.5em
      height 3em
      width 14em
      font-size 1.25em
      font-weight bold
      line-height 1.5em
      text-align left

      & > .non-blink
        white-space pre-wrap

      & > .blink
        animation blink 1s step-end infinite
        white-space pre-wrap

      @keyframes blink
        50%
          opacity 0
        100%
          opacity 1

    & > .underButton
      padding 0 0.5em
      font-size 1em
      line-height 1.25em
      text-align center

    & > input[type=button]
      margin 1.5em 0
      font-size 2em
      font-weight bold
      text-transform uppercase

</style>
