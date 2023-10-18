import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueCookies from 'vue-cookies'
import httpClient from './plugins/useHttpClient'
import corbadoSession from './plugins/useCorbadoSession'

const app = createApp(App)

app.use(router)
    .use(VueCookies)
    .use(httpClient, { router })
    .use(corbadoSession);

console.log(app.config);
app.mount('#app')
