# Tvorsvit

[![CI](https://github.com/lirriya/Tvorsvit/actions/workflows/ci.yml/badge.svg)](https://github.com/lirriya/Tvorsvit/actions/workflows/ci.yml)

**твори світ** — "create a world"

Tvorsvit is a local-first worldbuilding and creative writing app. It lets you write novels and drafts in a distraction-free editor while building out your world: character cards, location cards, relationship links, and a graph view connecting everything by relationship, location, or shared person. All data is stored on your own PC.

## Status

Early stage. Currently a full-stack prototype: a React SPA with a **worlds dashboard** (`/`), a **writing editor** (`/worlds/:id`), **character cards** (`/worlds/:id/characters`) with rich profile fields and character↔character relationships, **location cards** (`/worlds/:id/places`) with place↔place relationships, and a shared accent **color picker with a personal color library**. Backed by a Spring Boot REST API that stores everything in an embedded H2 database on your PC.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, JavaScript (JSX) |
| Backend | Java 25, Spring Boot 4.1, Maven |
| Storage | H2 embedded file database (`data/tvorsvit.mv.db`) |
| Testing | JUnit 5 / Spring Boot Test |

## Repo structure

```
tvorsvit-backend/    Spring Boot REST API (port 8081)
  src/main/java/tvorsvit/
  src/test/java/tvorsvit/
tvorsvit-frontend/   React + Vite SPA (port 5173)
  src/
```

## Architecture

```mermaid
flowchart LR
    subgraph PC [User's PC]
        F[React SPA - Vite :5173] -->|same-origin /api/* - proxied to :8081| B
        subgraph BE [Spring Boot :8081]
            B[WorldController] --> R[WorldRepository]
            B --> CC[CharacterController]
            B --> PCc[PlaceController]
            B --> CR[CharacterRelationController]
            B --> PR[PlaceRelationController]
            B --> S[StatusController]
            R --> DB[(H2 file - data/tvorsvit.mv.db)]
            CC --> DB
            PCc --> DB
            CR --> DB
            PR --> DB
        end
    end
```

## How to run

Backend (terminal 1):

```
cd tvorsvit-backend
.\mvnw.cmd spring-boot:run
```

Frontend (terminal 2):

```
cd tvorsvit-frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` requests to the backend on port 8081, so the SPA stays same-origin. While developing you can inspect the database directly at http://localhost:8081/h2-console (JDBC URL `jdbc:h2:file:./data/tvorsvit`).

Docs: `docs/api.md` (endpoint reference), `docs/data-model.md` (schema), `docs/frontend.md` (SPA structure and data flow), `docs/characters.md` + `docs/character-relations.md`, `docs/places.md` + `docs/place-relations.md`, `docs/custom-fields.md`, and `docs/color-picker.md`.

## Roadmap

- Editor with autosave (Google-Docs-style editing)
- ~~Character cards~~ — done (`docs/characters.md`)
- ~~Location cards~~ — done (`docs/places.md`)
- ~~Relationship links~~ — character↔character and place↔place done (`docs/character-relations.md`, `docs/place-relations.md`)
- Graph view connecting everything by relationship, location, or shared person
- Authorisation and optional server-hosted data mode