# Lesson: Docker Lokal — Kotak Bisnis

> Sumber awal: lesson `docker-nextjs.md` + `server-setup.md` Undanganku, diadaptasi untuk local-only (Spring Boot JAR + Vite).

## docker-compose.yml (root) — baseline
```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: kotak_db
    environment:
      POSTGRES_DB: ${DB_NAME:-kotak_bisnis}
      POSTGRES_USER: ${DB_USER:-kotak}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-kotak}
    ports: ["5432:5432"]
    volumes: [kotak_pgdata:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-kotak} -d ${DB_NAME:-kotak_bisnis}"]
      interval: 5s
      retries: 10

  backend:
    build: ./backend
    env_file: ./backend/.env
    environment:
      DB_HOST: db            # di dalam network compose, BUKAN localhost
    depends_on:
      db: { condition: service_healthy }
    ports: ["8080:8080"]
    profiles: ["full"]

  frontend:
    build: ./frontend
    depends_on: [backend]
    ports: ["5173:80"]
    profiles: ["full"]

volumes:
  kotak_pgdata:
```
- Default `docker compose up -d` → hanya `db`. Full stack: `docker compose --profile full up -d --build`
- Port 5432 bentrok dengan Postgres lokal → ubah **host** saja (`"5433:5432"`) dan `DB_PORT` di `.env`

## Backend Dockerfile (multi-stage)
```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## Frontend Dockerfile (Vite build → nginx)
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
ARG VITE_APP_TITLE
ENV VITE_APP_TITLE=$VITE_APP_TITLE
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```
`nginx.conf` minimal: SPA fallback + proxy API (supaya same-origin, tanpa CORS):
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  location /api/ { proxy_pass http://backend:8080; }
  location / { try_files $uri /index.html; }   # deep link React Router tidak 404
}
```

## `VITE_*` = build time
Sama seperti `NEXT_PUBLIC_*` (bug Undanganku: URL jadi `undefined/...`). Set lewat `ARG` + `--build-arg`, **bukan** `environment:` saat runtime.

## .dockerignore
```
# backend/.dockerignore
target
.env
lessons
# frontend/.dockerignore
node_modules
dist
.env*
lessons
```

## Hal yang dulu dipelajari di VPS (simpan untuk nanti kalau deploy)
- RAM VPS kecil (≈2 GB) → batasi heap JVM (`-Xmx512m`) dan jangan jalankan build di server
- Container antar-project bisa share satu network eksternal + satu container Postgres
- JBoss EAP = berbayar (subscription Red Hat); alternatif gratis WildFly — tapi untuk project ini JAR + Docker sudah cukup

## Troubleshooting
| Gejala | Penyebab | Fix |
|---|---|---|
| Backend container `Connection refused` ke DB | `DB_HOST=localhost` di dalam container | `DB_HOST=db` (nama service) |
| Refresh di `/dashboard` → 404 (nginx) | Tidak ada SPA fallback | `try_files $uri /index.html` |
| Data DB hilang | Volume tidak named / `down -v` | Named volume; `down -v` hanya dengan izin user |
