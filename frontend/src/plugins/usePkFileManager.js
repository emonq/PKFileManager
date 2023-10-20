import axios from "axios";
import {ref} from 'vue';
import {
    create,
    parseCreationOptionsFromJSON,
} from "@github/webauthn-json/browser-ponyfill";
import {startRegistration, browserSupportsWebAuthnAutofill, startAuthentication} from '@simplewebauthn/browser';

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
        pkFileManager.user = ref(null);

        pkFileManager.registerNewKey = async (username, email) => {
            let res = await http.post('/api/user/signUpStart');
            let options = res.data;
            let credential = await startRegistration(options);
            console.log(credential);
            const promise = http.post('/api/user/signUpFinish', credential);
            promise.then((res) => {
                pkFileManager.user.value = res.data;
                promise.resolve(res);
            });
            promise.catch(err => {
                promise.reject(err);
            })
            return promise;
        }

        pkFileManager.signUp = async (username, email) => {
            let res = await http.post('/api/user/signUpStart', {username, email});
            let options = res.data;
            let credential = await startRegistration(options);
            console.log(credential);
            const promise = http.post('/api/user/signUpFinish', credential);
            promise.then((res) => {
                pkFileManager.user.value = res.data;
                promise.resolve(res);
            });
            promise.catch(err => {
                promise.reject(err);
            })
            return promise;
        }

        pkFileManager.signIn = async (username) => {
            let res = await http.post('/api/user/login', {username});
            let options = res.data;
            console.log('options')
            console.log(options)
            let credential = await startAuthentication(options);
            console.log('credential')
            console.log(credential);
            const promise = http.post('/api/user/login', credential);
            promise.then((res) => {
                pkFileManager.user.value = res.data;
                promise.resolve(res);
            });
            promise.catch(err => {
                promise.reject(err);
            })
            return promise;
        }

        app.provide('$pkFileManager', pkFileManager);
    },
};

export default pkFileManager;