import Corbado from '@corbado/webcomponent';
import { ref } from 'vue';

const corbadoProjectID = import.meta.env.VITE_CORBADO_PROJECT_ID;
const session = new Corbado.Session(corbadoProjectID);

const token = ref(null);

const corbadoSession = {
    install(app, options) {
        app.config.globalProperties.$session = session;
        app.provide('$session', session);

        app.config.globalProperties.$token = token;
        app.provide('$token', token);
    }
};

export default corbadoSession;
export { session, token }