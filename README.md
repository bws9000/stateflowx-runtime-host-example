# StateFlowX Runtime Host Demo

Minimal external runtime host example for StateFlowX.

This project demonstrates how to host the StateFlowX runtime outside of the main monorepo using the published npm packages.

## Features

- External npm package consumption
- HTTP JSON-RPC runtime hosting
- Dynamic runtime initialization
- Gemini AI provider integration
- Remote workflow registration
- HTTP service orchestration
- Runtime bootstrap API

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
http://localhost:3000/rpc
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
HTTP
  ->
JSON-RPC
  ->
StateFlowX Runtime
  ->
Dynamic Workflow Registration
  ->
HTTP Services
  ->
Gemini Provider
  ->
Structured AI Response
```

---

## Status

Experimental / Active Development

This project is currently evolving rapidly as the runtime architecture and orchestration model are refined.