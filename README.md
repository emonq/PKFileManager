# PK File Manager

A file manager aims at better security.

## Features

- [x] Fully Passwordless with Passkey

## Deployment

### 1. Docker (recommended)

### (1) deploy seperately

#### Backend (server)

The backend application requires following environment variables:

**NODE_ENV**: development or production

**ORIGIN**: Origin of the frontend, used for CORS

**RP_ID**: Relying party ID used for passkey registration and authentication, it should be same as the frontend website host.

**EXPRESS_PORT**: Port for express.

**SESSION_SECRET** (optional): A secret string used to sign the session ID cookie. If not specified, a random string will be generated every time the application runs.

**SMTP_USERNAME**, **SMTP_PASSWORD**, **SMTP_SERVER**, **SMTP_SERVER_PORT**, **SMTP_FROM**: Username, password, host, port and from for SMTP to send login code email.

**TMP_FILE_DIR** (optional): Tmp directory for file upload, default to `/tmp`.

**FILE_STORAGE_DIR**: Directory to save user uploaded files.

**SECURE_COOKIE**: Used to see secure attribute on cookie. Set to true only when you are using HTTPS.

**BEHIND_PROXY**: If the application is behind a proxy, set to true to trust the proxy and ensure secure cookie working.

You can specified these environment variables in `docker-compose.yml` in `server` directory or place them in a `.env` file. After that, use `docker-compose build` and `docker-compose up -d` to run the backend service.

#### Frontend

Run `npm install && npm run build` in `frontend` directory . Then serve the static files in `dist` with whatever web server you like.

The following environment variables are required by frontend application build.

**NODE_ENV**: development or production

**VITE_API_BASE_URL**: The base url of the backend(API) application.

### (2) deploy with docker compose include both backend and frontend

Create a `.env` file in this directory with all environment variables mentioned above and set the hostname for your application in `Caddyfile`, both frontend and backend will be served by caddy with the given hostname.
