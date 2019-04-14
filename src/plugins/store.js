import Vue from "vue"
import Vuex from "vuex"
import numToCol from "../utils/numToCol"

Vue.use( Vuex )

// TODO: add modules

/* eslint-disable no-magic-numbers */
const store = new Vuex.Store( {
  state: {
    colorSchemes: {
      "standard": [ 0xffffff, 0x000000, ],
      "yellow": [ 0x99ff00, 0x000000, ],
      "orange": [ 0xff3300, 0x000000, ],
      "pink": [ 0xff0066, 0x000000, ],
      "mint": [ 0x00ff99, 0x000000, ],
      "blue": [ 0x00ffff, 0x000000, ],
      "matrix": [ 0x00ff00, 0x000000, ],
      "BSoD": [ 0xffffff, 0x000082, ],
      "RSoD": [ 0xffffff, 0x820000, ],
      "japan": [ 0xbc002d, 0xffffff, ],
      "paper": [ 0x000000, 0xffffff, ],
    },
    chosenColorScheme: null,
    notes: [ "C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B", ],
    frequencies: [
      16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87,
      32.70, 34.65, 36.71, 38.89, 41.20, 43.65, 46.25, 49.00, 51.91, 55.00, 58.27, 61.74,
      65.41, 69.30, 73.42, 77.78, 82.41, 87.31, 92.50, 98.00, 103.8, 110.0, 116.5, 123.5,
      130.8, 138.6, 146.8, 155.6, 164.8, 174.6, 185.0, 196.0, 207.7, 220.0, 233.1, 246.9,
      261.6, 277.2, 293.7, 311.1, 329.6, 349.2, 370.0, 392.0, 415.3, 440.0, 466.2, 493.9,
      523.3, 554.4, 587.3, 622.3, 659.3, 698.5, 740.0, 784.0, 830.6, 880.0, 932.3, 987.8,
      1047, 1109, 1175, 1245, 1319, 1397, 1480, 1568, 1661, 1760, 1865, 1976,
      2093, 2217, 2349, 2489, 2637, 2794, 2960, 3136, 3322, 3520, 3729, 3951,
      4186, 4435, 4699, 4978, 5274, 5588, 5920, 6272, 6645, 7040, 7459, 7902,
    ],
    keyCodes: [
      "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7",
      "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU",
      "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ",
      "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM",
    ],
    keyMap: [ 0, 2, 4, 5, 7, 9, 11, ],
    numberOfMajorNotesInOctave: 7,
    numberOfNotesInOctave: 12,
    modes: [ "synthesizer", "theremin", ],
    oscillatorTypes: [ "sine", "square", "sawtooth", "triangle", ],
    octaveOffsets: [ 0, 1, 2, 3, 4, 5, ],
    userSettings: {
      colorScheme: null,
      mode: null,
      synthesizerOscillatorType: null,
      synthesizerOctaveOffset: null,
      synthesizerVolume: null,
      thereminOscillatorType: null,
      thereminOctaveOffset: null,
      thereminBgOpacity: null,
    },
  },
  mutations: {
    colorScheme( state, index ) {
      document.documentElement.style.setProperty( "--main-color", numToCol( state.colorSchemes[ index ][ 0 ] ) )
      document.documentElement.style.setProperty( "--main-bg-color", numToCol( state.colorSchemes[ index ][ 1 ] ) )
      state.userSettings.colorScheme = index
    },
    mode( state, mode ) {
      state.userSettings.mode = mode
    },
    synthesizerOscillatorType( state, type ) {
      state.userSettings.synthesizerOscillatorType = type
    },
    synthesizerOctaveOffset( state, offset ) {
      state.userSettings.synthesizerOctaveOffset = +offset
    },
    synthesizerVolume( state, vol ) {
      state.userSettings.synthesizerVolume = +vol
    },
    thereminOscillatorType( state, type ) {
      state.userSettings.thereminOscillatorType = type
    },
    thereminOctaveOffset( state, offset ) {
      state.userSettings.thereminOctaveOffset = +offset
    },
    thereminBgOpacity( state, val ) {
      state.userSettings.thereminBgOpacity = +val
    },
  },
} )

export default store
