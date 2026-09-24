# REST API

Base URL: `http://localhost:8081` · Content type: `application/json` · CORS: `http://localhost:5173` allowed for all `/api/**` routes.

## Endpoints

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | `/api/status` | Service health / availability | 200 |
| GET | `/api/worlds` | List all worlds, newest first | 200 |
| POST | `/api/worlds` | Create a world | 201 (created body) |
| GET | `/api/worlds/{id}` | Fetch one world | 200 |
| PUT | `/api/worlds/{id}` | Update name / type / description / color | 200 (updated body) |
| DELETE | `/api/worlds/{id}` | Delete a world | 204 |

Errors: unknown id → `404`; validation or malformed payload → `400`.

## World object

```json
{
  "id": 1,
  "name": "Middle-earth",
  "type": "BOOK",
  "description": "A long ago age",
  "color": "#646cff",
  "content": null,
  "createdAt": "2026-09-24T10:05:12.345",
  "updatedAt": "2026-09-24T10:05:12.345"
}
```

| Field | Type | Notes |
|---|---|---|
| id | number | assigned by the database |
| name | string | required, non-blank, trimmed, max 80 |
| type | string | required, one of `BOOK` `TABLETOP_RPG` `GAME_LORE` `SHORT_STORY` `SCREENPLAY` `COMIC` `OTHER` |
| description | string | optional, max 300 |
| color | string | optional hex accent, e.g. `#646cff` |
| content | string | reserved for the editor; not settable through this API yet |
| createdAt / updatedAt | ISO-8601 string | timestamps |

`type` values are documented in `docs/data-model.md`.

## Example: create a world

Request:

```http
POST /api/worlds
Content-Type: application/json

{
  "name": "The Echoing Vale",
  "type": "TABLETOP_RPG",
  "description": "A haunted valley campaign setting",
  "color": "#22c55e"
}
```

Response `201 Created` (body is the full stored world, with `id` and timestamps filled in).

Minimal valid request — only `name` and `type` are required:

```json
{ "name": "Skyrim", "type": "GAME_LORE" }
```

## Validation rules

| Rule | Result |
|---|---|
| `name` blank or missing | 400 |
| `type` missing | 400 |
| `type` not one of the enum values | 400 |
| malformed JSON / unknown enum string | 400 |

Validation lives on `WorldRequest` (the API boundary), so invalid payloads never reach the repository.

## Create flow

```mermaid
sequenceDiagram
    participant FE as React SPA (:5173)
    participant C as WorldController
    participant R as WorldRepository
    participant DB as H2 (data/tvorsvit.mv.db)
    FE->>C: POST /api/worlds (JSON)
    C->>C: validate WorldRequest
    alt invalid (blank name, bad type)
        C-->>FE: 400 Bad Request
    else valid
        C->>R: save(World)
        R->>DB: INSERT (with timestamps)
        DB-->>R: id assigned
        R-->>C: persisted World
        C-->>FE: 201 Created + World JSON
    end
```