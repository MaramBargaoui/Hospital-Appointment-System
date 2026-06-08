# Hospital Appointment System — Project structure (brief)

**Purpose:** Two-part web app — **Angular** UI + **Spring Boot** API. SQLite file database. JWT auth with roles (Patient, Doctor, Receptionist, Admin).

---

## Top-level folders

| Folder | Role |
|--------|------|
| `backend/` | REST API (Java 17, Maven), security, persistence |
| `frontend/` | SPA (Angular 20), routes, HTTP to `/api` |
| `README.md` | Product vision & actors (future modules described there) |
| `docs/` | This overview |

**Build output (ignore when explaining source):** `frontend/dist/`, `frontend/.angular/cache/`.

---

## Backend (`backend/`)

| Path | Contents |
|------|----------|
| `pom.xml` | Dependencies: Spring Web, Security, Data JPA, Validation, JWT (jjwt), SQLite JDBC |
| `mvnw`, `mvnw.cmd` | Maven wrapper (no global Maven required) |
| `src/main/resources/application.properties` | Port **8080**, SQLite `./data/hospital.db`, JWT & seed admin settings |
| `src/main/java/.../HospitalApiApplication.java` | Spring Boot entry |
| `domain/` | `User` entity, `Role` enum |
| `repository/` | `UserRepository` (Spring Data JPA) |
| `api/auth/` | `AuthController` (`/register`, `/login`, `/me`), DTOs, `AuthService` |
| `api/admin/` | `AdminUserController` + service + DTOs — **ADMIN-only** user CRUD under `/api/admin/users` |
| `api/` | `HealthController`, `RestExceptionHandler` |
| `security/` | JWT filter & service, `UserPrincipal`, `DatabaseUserDetailsService` |
| `config/` | `SecurityConfig`, `WebConfig` (CORS), `DataSeed`, SQLite directory helper |
| `src/test/` | Spring Boot test + `application-test.properties` (in-memory SQLite) |

**Data file (runtime):** `backend/data/hospital.db` when the API is started from `backend/`.

---

## Frontend (`frontend/`)

| Path | Contents |
|------|----------|
| `package.json` | Scripts: `ng serve`, `ng build`; Angular 20 |
| `angular.json` | Dev server **proxy** → `http://localhost:8080` for `/api` |
| `proxy.conf.json` | Proxies browser `/api/*` to the Spring API |
| `src/main.ts`, `src/app/app.config.ts` | Bootstrap, HTTP client + **auth interceptor** |
| `src/app/app.routes.ts` | `/login`, `/register`, `/dashboard`, `/users` (admin guard) |
| `src/app/auth/` | Login/register, `AuthService`, guards, interceptor, models |
| `src/app/dashboard/` | Post-login home |
| `src/app/users/` | Admin user management UI + `UsersService` |

---

## Request flow (dev)

Browser → `localhost:4200` (Angular) → relative `/api/...` → **proxy** → `localhost:8080` (Spring). JWT sent as `Authorization: Bearer …` after login.

---

## Implemented vs. README vision

**Implemented today:** authentication, JWT, roles, admin **user directory** CRUD, dashboard shell.

**Planned in root README (not in this codebase yet):** appointments, doctors, medical records, notifications, full admin analytics.

---

*Generated for presentation — scan date aligned with repository contents.*
