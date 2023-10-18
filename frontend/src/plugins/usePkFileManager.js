import axios from "axios";
import {ref} from 'vue';
import {
    create,
    parseCreationOptionsFromJSON,
} from "@github/webauthn-json/browser-ponyfill";

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
            console.log(pkFileManager.user.value)
            if (pkFileManager.user.value) {
                username = pkFileManager.user.value.name;
                email = pkFileManager.user.value.email;
            }
            console.log({username, email})
            let res = await http.post('/api/user/webauthn/start', {username, email})
            const publicKeyCredentialCreationOptions = parseCreationOptionsFromJSON(res.data);
            console.log(publicKeyCredentialCreationOptions)
            const credential = await create(publicKeyCredentialCreationOptions);
            console.log(credential);
            console.log({publicKeyCredential: JSON.stringify(credential)});
            res = await http.post('/api/user/webauthn/finish', {publicKeyCredential: JSON.stringify(credential)});
        }

        app.provide('$pkFileManager', pkFileManager);
    },
};

export default pkFileManager;