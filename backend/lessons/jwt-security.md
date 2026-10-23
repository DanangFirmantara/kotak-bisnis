# Lesson: JWT Security — Kotak Bisnis

> Sumber awal: lesson project Undanganku (JJWT 0.12.3, Spring Boot 3.3), diadaptasi.

## Stack
- JJWT 0.12.x, HS256, expiry 900000 ms (15 menit), secret dari env `JWT_SECRET`

## Auth Flow
1. `POST /api/auth/login` → validasi credential → JWT → `{token, expiresIn, user}`
2. Frontend kirim `Authorization: Bearer <token>` di setiap request (kecuali login)
3. `JwtAuthFilter extends OncePerRequestFilter` → validasi → set `SecurityContextHolder`
4. Expired/invalid → **401** → frontend auto-logout. Token valid tapi role kurang → **403**

## Role Convention
- Tabel `roles` + `user_roles` (many-to-many). Nama role disimpan `ROLE_ADMIN`, `ROLE_USER`
- `@PreAuthorize("hasRole('ADMIN')")` — Spring menambah prefix `ROLE_` otomatis
- Claim JWT: `roles: ["ROLE_ADMIN"]`
- Password: BCrypt, kolom `password_hash VARCHAR(255)`

## JJWT 0.12 — cara yang benar
```java
// BENAR
.signWith(key, Jwts.SIG.HS256)
// SALAH — SignatureAlgorithm deprecated; HS512 + key < 64 byte → WeakKeyException
.signWith(key, SignatureAlgorithm.HS512)
```
Key: `Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8))` — secret **≥ 32 karakter** untuk HS256.

## SecurityConfig (lambda style) + CORS
Spring Security 6 **tidak** memproses `@CrossOrigin` tanpa `.cors()` eksplisit.
```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/auth/login", "/actuator/health").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .exceptionHandling(e -> e.authenticationEntryPoint(
                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))   // 401, bukan 403, saat token tidak ada/invalid
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));   // Vite dev
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```
- Dengan Vite proxy (`/api` → 8080) request dari browser same-origin → CORS jarang kepakai di dev, tapi tetap pasang
- `CorsConfigurationSource` dibuat `@Bean` di class yang sama (bukan inject constructor) → hindari circular dependency
- Semua endpoint public harus eksplisit di `requestMatchers` (yang sering lupa: `/api/auth/refresh`, `/api/auth/validate`)

## Troubleshooting
| Gejala | Penyebab | Fix |
|---|---|---|
| 401 semua request | `JWT_SECRET` tidak ter-set / beda antara generate & validate | Cek `backend/.env` |
| `WeakKeyException` saat start | Secret < 32 char | Perpanjang secret |
| 403 padahal belum login | Tidak ada `authenticationEntryPoint` → default 403 | Pasang `HttpStatusEntryPoint(UNAUTHORIZED)` |
| 403 dengan token valid | Role tidak cocok | Cek `user_roles`, `hasRole('ADMIN')` bukan `'ROLE_ADMIN'` |
| CORS error di browser | `.cors()` tidak dipanggil | Tambahkan di `filterChain()` |
| 403 di endpoint login | Belum `permitAll()` | Tambah ke `requestMatchers` |
