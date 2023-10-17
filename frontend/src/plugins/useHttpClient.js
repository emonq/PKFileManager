import axios from "axios"

const backendUrl = import.meta.env.VITE_API_BASE_URL
const http = axios.create({
    baseURL: backendUrl,
    headers: {
    }
});


const httpClient = {
    install: (app, options) => {
        const router = options.router;
        http.updateToken = (token) => {
            http.defaults.headers.common['Authorization'] = `Bearer ${token}`
        };
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

        app.provide('$http', http);
    }
}

export default httpClient;