# Frontend

The Tvorsvit SPA: routes, the worlds dashboard and the world editor. Stack: React 19, Vite, react-router-dom. Talks to the backend through the Vite dev proxy (`/api` → `http://localhost:8081`), so requests stay same-origin.

## App structure

```
src/
  main.jsx                 entry point; mounts BrowserRouter
  App.jsx                  route table
  api.js                   REST client (one fetch wrapper + semantic functions)
  worldTypes.js            enum → label mapping shared by card and modal
  worldThemes.js           world theme registry (dots + labels)
  colorLibrary.js          curated palette + localStorage color library/recent
  placeRelationTypes.js    place relation enum → label mapping
  characterRelationTypes.js character relation enum → label mapping
  index.css / App.css      global base + component styles
  components/
    WorldCard.jsx          card that links to /worlds/:id
    CreateWorldModal.jsx   create form as a modal dialog
    EditWorldModal.jsx     edit / delete a world
    CharacterCard.jsx      card for a character (accent, name, description)
    CharacterDetails.jsx   read-only character view (fields, custom fields, relations)
    CharacterModal.jsx     create/edit a character (one component, two modes)
    CharacterRelationsPanel.jsx  character↔character relations (in CharacterModal)
    PlaceCard.jsx          card for a place (photo, name, description)
    PlaceModal.jsx         create/edit a place (one component, two modes)
    PlaceRelationsPanel.jsx place↔place relations (in PlaceModal)
    CustomFieldsEditor.jsx reusable label/value custom-field editor
    ColorPicker.jsx        shared accent color picker + library
    WorkbenchRail.jsx      world section nav with live counts
  pages/
    Dashboard.jsx          "/" — world grid + "+ Create new world" tile
    Workspace.jsx          "/worlds/:id/:section?" — editor + characters + places
```

## Routes

```mermaid
flowchart LR
    BrowserRouter --> Root{/}
    Root -->|"/"| Dashboard["Dashboard — world grid + create tile"]
    Root -->|"/worlds/:id"| Workspace["Workspace — story editor"]
    Workspace -->|"/:section=characters"| Characters["Characters grid"]
    Workspace -->|"/:section=places"| Places["Places grid"]
    Dashboard -->|card click| Workspace
    Workspace -->|"← All worlds"| Dashboard
```

The URL is the source of truth: the workspace knows *which* world and *which* section to show from the path params (`useParams`), and every view is deep-linkable (back/forward, bookmarks, refresh all work).

## Create flow

```mermaid
sequenceDiagram
    participant User
    participant Modal as CreateWorldModal
    participant Dash as Dashboard
    participant Api as api.js
    participant Proxy as Vite proxy (:5173/api)
    participant BE as Backend (:8081)
    User->>Modal: fill form + Create
    Modal->>Modal: validate (name, type)
    Modal->>Api: createWorld(payload)
    Api->>Proxy: POST /api/worlds
    Proxy->>BE: forward same request
    BE-->>Proxy: 201 + created world
    Proxy-->>Api: created world JSON
    Api-->>Modal: created
    Modal-->>Dash: onCreated(world)
    Dash->>Dash: prepend card (server sorts newest first)
```

## Editor flow

```mermaid
flowchart LR
    E[Editor] -->|useParams id| G[api.getWorld]
    G -->|load| T[textarea with content]
    T -->|edit| D{dirty?}
    D -->|yes| S[Save content button enabled]
    S -->|PUT /worlds/:id/content| R{saved?}
    R -->|ok| OK[status: Saved]
    R -->|fail| ERR[status: Save failed]
```

## Decisions worth knowing

- **Proxy instead of absolute URLs**: same-origin requests in dev (no CORS preflight, works from LAN devices). The backend CORS config remains as a safety net.
- **Optimistic prepend**: the create response is used directly instead of refetching — one less round trip, and it matches the server's newest-first order.
- **Native form semantics**: Enter submits from the name field (implicit submission), Enter in the textarea makes a newline; Escape and backdrop click close the modal via one tiny handler.
- **`react-hooks/set-state-in-effect`**: data loading wires `setState` through promise callbacks (`.then`), never synchronously in an effect body, per the current React hooks lint rules.
- **`<Link>` for cards**: cards are navigations, so they are anchors — middle-click, keyboard focus and screen-reader semantics come free.