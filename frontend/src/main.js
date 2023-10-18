import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueCookies from 'vue-cookies'
import pkFileManager from './plugins/usePkFileManager'

const app = createApp(App)

app.use(router)
    .use(VueCookies)
    .use(pkFileManager, { router });

app.mount('#app')
