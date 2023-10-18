import axios from "axios"
import Cookies from "js-cookie";

const backendUrl = import.meta.env.VITE_API_BASE_URL
const http = axios.create({
    baseURL: backendUrl,
    headers: {
    }
});

const httpClient = {
    install: (app, options) => {
        const router = options.router;
        http.interceptors.request.use((config) => {
            config.headers.Authorization = `Bearer ${Cookies.get('cbo_short_session')}`;
            return config;
        })
        http.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                if (error.response.status === 401) {
                    router.push('/auth');
                    return Promise.resolve(error.response);
                }
                return Promise.reject(error);
            }
        );
        app.config.globalProperties.$http = http;
        app.provide('$http', http);
    }
}

export default httpClient;