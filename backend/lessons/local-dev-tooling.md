# Lesson: Local Dev Tooling — Kotak Bisnis

> Sumber awal: lesson JBoss/local-dev Undanganku (bagian yang tidak spesifik JBoss), diadaptasi untuk JAR.

## Environment mesin ini (dicek 2026-10-23)
- JDK lokal **26**, Maven 3.9.11, Node 24, Docker 28 — Python juga ada tapi tidak dibutuhkan
- Project target Java **21** → set di `pom.xml`:
  ```xml
  <properties>
      <java.version>21</java.version>
      <maven.compiler.release>21</maven.compiler.release>
  </properties>
  ```
  Compile pakai JDK 26 dengan `release 21` aman. Kalau ada plugin/library yang error di JDK 26, install JDK 21 dan set `JAVA_HOME` sementara.
- `maven-compiler-plugin` dengan `<parameters>true</parameters>` (nama param untuk `@PathVariable`/`@RequestParam` tanpa value eksplisit)

## `.env` via spring-dotenv
```xml
<dependency>
    <groupId>me.paulschwarz</groupId>
    <artifactId>spring-dotenv</artifactId>
    <version>4.0.0</version>
</dependency>
```
`backend/.env` → terbaca sebagai `${VAR}` di `application.yml`. **Jangan commit `.env`**, sediakan `.env.example`:
```env
JWT_SECRET=ganti-dengan-random-minimal-32-karakter
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kotak_bisnis
DB_USER=kotak
DB_PASSWORD=kotak
```
Catatan: `mvn spring-boot:run` dijalankan dari folder `backend/` supaya `.env` ketemu (dicari di working dir).

## Hot reload
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>
```
Otomatis non-aktif di JAR hasil `package`.

## `@EnableJpaAuditing` hanya di SATU tempat
Taruh di `config/AuditingConfig.java`. Kalau juga ada di `Application.java` →
`BeanDefinitionOverrideException: Invalid bean definition with name 'jpaAuditingHandler'`.

## Run & build
```bash
cd backend
mvn spring-boot:run          # dev, port 8080
mvn -q compile               # verifikasi cepat
mvn clean package -DskipTests  # target/kotak-bisnis-backend-*.jar
```

## Troubleshooting
| Gejala | Penyebab | Fix |
|---|---|---|
| Port 8080 already in use | Proses lain / instance lama | PowerShell: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080 -State Listen).OwningProcess -Force` |
| `jpaAuditingHandler` override | `@EnableJpaAuditing` dobel | Hapus dari `Application.java` |
| `Could not resolve placeholder 'JWT_SECRET'` | `.env` tidak ketemu | Jalankan dari `backend/`, cek file `.env` ada |
| `Connection refused :5432` | Container Postgres belum jalan | `docker compose up -d db` |
