import Vue from "vue"
import App from "./App.vue"
import store from "./plugins/store"

Vue.config.productionTip = false

new Vue( {
  store,
  render: createInstance => createInstance( App ),
} ).$mount( "#app" )
