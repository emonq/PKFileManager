import axios from "axios";
import {ref} from 'vue';
import {startAuthentication, startRegistration} from '@simplewebauthn/browser';

const backendUrl = import.meta.env.VITE_API_BASE_URL


const pkFileManager = {
    install: (app, options) => {
        const router = options.router;

        const http = axios.create({
            baseURL: backendUrl,
            withCredentials: true,
        });
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

        pkFileManager.user = ref(null);
        pkFileManager.getMe = () => {
            http.get('/api/user/me')
                .then((res) => {
                    pkFileManager.user.value = res.data;
                });
        }

        pkFileManager.logout = () => {
            http.post('/api/user/logout').then(() => {
                pkFileManager.user.value = null;
                router.push('/auth');
            });
        }

        pkFileManager.registerNewKey = async () => {
            let res = await http.post('/api/user/signUpStart');
            let options = res.data;
            let credential = await startRegistration(options);
            console.log(credential);
            res = await http.post('/api/user/signUpFinish', credential);
            pkFileManager.user.value = res.data;
        }

        pkFileManager.removeKey = async (id) => {
            let res = await http.delete('/api/user/removeKey', {data: {id}});
            pkFileManager.user.value = res.data;
        }

        pkFileManager.signUp = async (username, email) => {
            let res = await http.post('/api/user/signUpStart', {username, email});
            let options = res.data;
            let credential = await startRegistration(options);
            console.log(credential);
            res = await http.post('/api/user/signUpFinish', credential);
            pkFileManager.user.value = res.data;
            return res;
        }

        pkFileManager.signInPasskey = async (username) => {
            let res = await http.post('/api/user/loginStart', {username});
            let options = res.data;
            console.log('options')
            console.log(options)
            let credential = await startAuthentication(options);
            console.log('credential')
            console.log(credential);
            res = await http.post('/api/user/loginFinish', credential);
            pkFileManager.user.value = res.data;
            return res;
        }

        pkFileManager.signInEmailStart = async (username) => {
            return await http.post('/api/user/loginStart', {username, method: 'email'});
        }

        pkFileManager.signInEmailFinish = async (code) => {
            let res = await http.post('/api/user/loginFinish', {code});
            pkFileManager.user.value = res.data;
            return res;
        }

        app.provide('$pkFileManager', pkFileManager);
    },
};

export default pkFileManager;