# Lesson: Database & Flyway — Kotak Bisnis

> Sumber awal: lesson project Undanganku (PostgreSQL 16 + Flyway), diadaptasi.

## Stack
- PostgreSQL 16, Flyway (SQL, bukan Liquibase)
- Location: `classpath:db/migration` → `backend/src/main/resources/db/migration/`
- `spring.jpa.hibernate.ddl-auto: validate` — skema milik Flyway; kalau entity ≠ tabel, app gagal start (bagus: ketahuan dini)

## Audit Columns (7 field — wajib setiap tabel bisnis)
```sql
id          BIGSERIAL    PRIMARY KEY,
guid        UUID         NOT NULL UNIQUE DEFAULT gen_random_uuid(),
...business columns...
created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
created_by  VARCHAR(100) NOT NULL,
updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_by  VARCHAR(100) NOT NULL,
deleted_at  TIMESTAMP    NULL
```
`created_by/updated_by` diisi Spring Data Auditing (`AuditorAware` ambil username dari SecurityContext;
fallback `"system"` untuk seed/job tanpa user).

## Soft-Delete
- `deleted_at IS NULL` = aktif. Entity: `@SQLDelete` + `@SQLRestriction("deleted_at IS NULL")`
- Index: `CREATE INDEX idx_{table}_deleted_at ON {table} (deleted_at);`
- Unique aktif saja: `CREATE UNIQUE INDEX uq_{table}_{col} ON {table} ({col}) WHERE deleted_at IS NULL;`
- Native query **tidak** kena `@SQLRestriction` — tulis `WHERE deleted_at IS NULL` manual

## Aturan Flyway
- **Jangan edit migration yang sudah di-commit** → checksum mismatch. Buat versi baru (hook memblokir)
- Versi sequential: `V1__init_schema.sql`, `V2__seed_roles_users.sql`, ...
- Selama belum di-commit & hanya ada di DB lokal, boleh edit — lalu reset DB lokal (`flyway clean` / recreate volume) supaya checksum ulang

## BCrypt Hash di Seed Data
Hash yang di-hardcode **wajib diverifikasi** sebelum commit (di Undanganku pernah salah → login 401 → butuh migration fix).
Cara generate tanpa Python — pakai jar dari `.m2`:
```powershell
$jar = (Get-ChildItem "$env:USERPROFILE\.m2\repository\org\springframework\security\spring-security-crypto" -Recurse -Filter *.jar | Select-Object -First 1).FullName
javac -cp "$jar" HashGen.java
java -cp ".;$jar" HashGen
```
```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class HashGen {
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("Admin@123456"));
    }
}
```
Kalau hash di migration ternyata salah dan sudah di-commit → jangan edit, buat migration UPDATE baru.

## HikariCP (penting kalau DB remote / container lama idle)
```yaml
spring:
  datasource:
    hikari:
      connection-timeout: 20000
      minimum-idle: 2
      maximum-pool-size: 10
      idle-timeout: 300000
      max-lifetime: 600000
      keepalive-time: 60000
```

## Troubleshooting
| Gejala | Penyebab | Fix |
|---|---|---|
| `FlywayException: checksum mismatch` | Migration yang sudah jalan diedit | Kembalikan file, atau (lokal saja) `flyway repair` / reset DB |
| `Schema-validation: missing column` saat start | Entity punya field yang belum ada di migration | Minta database-agent buat migration baru, jangan ubah `ddl-auto` |
| `relation already exists` | Migration jalan dua kali / tabel dibuat manual | Cek `flyway_schema_history` |
| 500 setelah idle beberapa menit | Koneksi Hikari putus | Tambah `keepalive-time` |
| Login 401 padahal user ada | Hash BCrypt seed salah | Generate ulang via HashGen, migration UPDATE |
