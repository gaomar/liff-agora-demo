import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import VConsole from 'vconsole'

Vue.config.productionTip = false

// vconsole
new VConsole()

new Vue({
  router,
  vuetify,
  render: function (h) { return h(App) }
}).$mount('#app')
