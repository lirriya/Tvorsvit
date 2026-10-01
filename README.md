# Tvorsvit

[![CI](https://github.com/lirriya/Tvorsvit/actions/workflows/ci.yml/badge.svg)](https://github.com/lirriya/Tvorsvit/actions/workflows/ci.yml)

**твори світ** — "create a world"

Tvorsvit is a local-first worldbuilding and creative writing app. It lets you write novels and drafts in a distraction-free editor while building out your world: character cards, location cards, relationship links, and a graph view connecting everything by relationship, location, or shared person. All data is stored on your own PC.

## Status

Early stage. Currently a full-stack prototype: a React workspace that sends draft text to a Spring Boot backend, which saves it to a local file.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, JavaScript (JSX) |
| Backend | Java 25, Spring Boot 4.1, Maven |
| Storage | Local file (currently), embedded database planned |
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
        F[React SPA - Vite :5173] -->|POST /api/save-test| B
        subgraph BE [Spring Boot :8081]
            B[SaveController] --> F1[(tvorsvit_draft.txt)]
            B --> S[StatusController]
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

Open http://localhost:5173, type your draft, and hit **Save Draft to PC**. The text is written to `tvorsvit_draft.txt` in the backend working directory.

## Roadmap

- Editor with autosave (Google-Docs-style editing)
- Character and location cards
- Relationship links and graph view
- Embedded local database (H2/SQLite file mode)
- Authorisation and optional server-hosted data mode