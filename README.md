# Real Time Chat App

<!-- Badges -->
[![Java 21](https://img.shields.io/badge/Java-21-007396?style=for-the-badge&logo=java&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.4-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![STOMP](https://img.shields.io/badge/STOMP-WebSocket-4A76A8?style=for-the-badge&logo=websocket&logoColor=white)](https://stomp.github.io/)
[![JWT](https://img.shields.io/badge/JWT-Auth-F9A825?style=for-the-badge)](https://jwt.io/)

Lightweight real-time chat application with a Java (Spring Boot) backend and a React + Vite frontend.

## Overview

- Backend: Spring Boot (REST + STOMP over WebSocket), JWT authentication, MySQL persistence.
- Frontend: React + Vite client using SockJS / STOMP for realtime messaging.

## Features

- User registration and login (JWT)
- Public and private chat messaging over WebSocket (STOMP)
- Message persistence in MySQL

## Prerequisites

- Java 21 JDK
- Maven (or use the included Maven wrapper)
- Node.js (16+ recommended) and npm
- H2 (or configure a different datasource)

## Project structure

- `back-end/` — Spring Boot application
- `front-end/` — React + Vite application

## Important configuration notes

- The backend default properties live in `back-end/src/main/resources/application.yaml` and include the server port (`server.port`), database connection, and JWT settings. Do NOT use the provided secrets/credentials in production — replace them before deploying.
- Default backend port in the sample config: 3000.
- WebSocket (STOMP) endpoint: `/ws`. Allowed origins in the example include `http://localhost:5173` and `http://localhost:3000`.

## Running locally (Windows)

Backend (from workspace root):

```powershell
cd back-end
./mvnw.cmd spring-boot:run
```

Or with Maven installed:

```powershell
mvn spring-boot:run
```

To run tests:

```powershell
./mvnw.cmd test
```

Frontend (from workspace root):

```powershell
cd front-end
npm install
npm run dev
```

The frontend dev server typically runs on port 5173. The app expects the backend API + WebSocket endpoint to be reachable (backend default port 3000 in sample config).

## Building for production

Backend:

```powershell
cd back-end
./mvnw.cmd clean package
# then run the produced JAR in target/
java -jar target/*.jar
```

Frontend:

```powershell
cd front-end
npm install
npm run build
# serve the files in dist/ using any static server
```

## Environment overrides

You can override Spring properties at runtime via JVM args or environment variables, for example:

```powershell
# change server port
./mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--server.port=8080"

# or pass properties to the packaged JAR
java -jar app.jar --server.port=8080 --jwt.secret=YOUR_SECRET
```

## Notes & Security

- The sample `application.yaml` in the repo contains example credentials and a sample JWT secret. Remove or replace them before deploying.
- Use secure storage for secrets (environment variables, vaults) in production.

## Where to look in the code

- Backend main: `back-end/src/main/java/com/simplechatapp/SimpleChatAppApplication.java`
- WebSocket config: `back-end/src/main/java/com/simplechatapp/config/WebSocketConfig.java` (STOMP endpoint `/ws`)
- Security config and JWT: `back-end/src/main/java/com/simplechatapp/config/SecurityConfig.java` and `back-end/src/main/java/com/simplechatapp/jwt/`
- Frontend entry: `front-end/src/main.jsx`

## Troubleshooting

- If the frontend cannot connect to WebSocket, ensure the backend is running and update allowed origins in `WebSocketConfig` or run the frontend on the allowed origin.
- Ensure MySQL is running and the datasource settings in `application.yaml` match your DB instance.

## License

This repository does not include a license file. Add one if you plan to publish the project.

---