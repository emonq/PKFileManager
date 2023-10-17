import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueCookies from 'vue-cookies'
import httpClient from './plugins/useHttpClient'

const app = createApp(App)

app.use(router)
    .use(VueCookies)
    .use(httpClient, { router });

console.log(app.config);
app.mount('#app')
