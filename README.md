# Real-Time Chat Application

A beginner-friendly real-time chat app built with Node.js, Express and Socket.IO.

## Features
- Join with a unique online username
- Send and receive messages instantly
- Live online-user list
- Join/leave notifications
- Message timestamps

## Run locally
Requires Node.js 20 or newer.

```bash
npm install
npm start
```

Open http://localhost:3000 in two or more browser tabs and join with different usernames.

## Run with Docker

```bash
docker build -t realtime-chat-app:1.0 .
docker run -d --name realtime-chat -p 3000:3000 realtime-chat-app:1.0
```

Open http://localhost:3000.

## GitHub Actions -> Docker Hub
Create a Docker Hub access token with Read & Write permission. In GitHub repository settings add:
- Repository variable `DOCKERHUB_USERNAME` = your Docker Hub username
- Repository secret `DOCKERHUB_TOKEN` = the access token value

Push the project to the `main` branch. The workflow in `.github/workflows/docker-publish.yml` builds and pushes:
- `YOUR_DOCKERHUB_USERNAME/realtime-chat-app:latest`
- `YOUR_DOCKERHUB_USERNAME/realtime-chat-app:<commit-sha>`

## Important limitations
This is a learning/demo project. Usernames are temporary online identities, not permanent password-protected accounts. Online users and messages are held in server memory; they disappear when the server restarts. For production, add a database, password hashing, authentication/session management, rate limiting, HTTPS, and persistent message storage.
