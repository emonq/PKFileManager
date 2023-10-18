import axios from "axios";

const CORBADO_PROJECT_ID = import.meta.env.VITE_CORBADO_PROJECT_ID;

const Corbado = {
    install: (app, options) => {
        const http = axios.create({
            baseURL: `https://${CORBADO_PROJECT_ID}.frontendapi.corbado.io`,
            withCredentials: true,
        });

        Corbado.

            app.provide('$Corbado', Corbado);
    }
};

export default Corbado;