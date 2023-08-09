import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Vuetify ---------Not using at present because we are in Vue 3 now and gene is still in Vue 2
// import 'vuetify/styles'
// import { createVuetify } from 'vuetify'
// import * as components from 'vuetify/components'
// import * as directives from 'vuetify/directives'

// const vuetify = createVuetify({
//   components,
//   directives,
// })

// createApp(App).use(vuetify).mount('#app')
createApp(App).mount('#app')
