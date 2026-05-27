# StateFlowX Runtime Host Demo

Minimal external runtime host example for StateFlowX.

This project demonstrates how to host the StateFlowX runtime outside of the main monorepo using the published npm packages.

## Features

- External npm package consumption
- WebSocket runtime hosting
- JSON-RPC protocol transport
- Realtime runtime event streaming
- Gemini AI provider integration
- Dynamic runtime initialization
- Runtime bootstrap API
- Event-driven orchestration

---

## Install

```bash
npm install
```

---

## Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## Run

```bash
node main.mjs
```

Runtime will start on:

```text
ws://localhost:3001
```

---

## Example Runtime Host

```js
import 'dotenv/config';

import {
  bootstrapHttpRuntime,
  RuntimeInitializeApp,
  GeminiProvider,
} from '@stateflowx/runtime';

await bootstrapHttpRuntime({
  apps: [
    new RuntimeInitializeApp(),
  ],

  providers: [
    {
      name: 'gemini',

      provider:
        new GeminiProvider(),
    },
  ],

  services: [],
});
```

---

## Related Projects

- StateFlowX Client Demo
- StateFlowX Runtime
- StateFlowX Client

---

## Architecture

```text
Client
  ->
WebSocket
  ->
JSON-RPC
  ->
StateFlowX Runtime
  ->
Providers
  ->
Runtime Events
  ->
Artifact Generation
```

---

## Status

Experimental / Active Development

This project is currently evolving rapidly as the runtime architecture and orchestration model are refined.