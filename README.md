# StateFlowX Runtime Host Demo

Minimal standalone runtime host for StateFlowX.

This project demonstrates how to host the StateFlowX Runtime outside of the main monorepo using the published npm packages.

## Features

- External npm package consumption
- HTTP JSON-RPC hosting
- WebSocket JSON-RPC hosting
- Multi-transport runtime
- Runtime lifecycle management
- Runtime initialization
- Runtime startup
- Runtime event streaming
- Pluggable provider registration
- Pluggable agent registration *(coming back soon)*
- Realtime observability foundation

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
OPENAI_API_KEY=your_openai_api_key
```

---

## Run

```bash
node main.mjs
```

The runtime starts on:

```text
HTTP JSON-RPC
http://localhost:3000/rpc

WebSocket JSON-RPC
ws://localhost:3001
```

---

## Example Runtime Host

```ts
import 'dotenv/config';

import {
  bootstrapHttpRuntime,
  RuntimeInitializeApp,
  GeminiProvider,
  OpenAIProvider,
  MockProvider,
  WebSocketTransport,
  WebSocketEventDispatcher,
} from '@stateflowx/runtime';

import { WebSocketServer } from 'ws';

const { runtime } = await bootstrapHttpRuntime({

  providers: [
    {
      name: 'openai',
      provider: new OpenAIProvider(),
    },
    {
      name: 'gemini',
      provider: new GeminiProvider(),
    },
    {
      name: 'mock',
      provider: new MockProvider(),
    },
  ],

  services: [],

  execution: {
    enabled: true,

    events: {
      enabled: true,
    },

    artifacts: {
      enabled: false,
    },
  },

  apps: [
    new RuntimeInitializeApp(),
  ],
});

const server = new WebSocketServer({
  port: 3001,
});

const websocket =
  new WebSocketTransport(server);

runtime.transports.push(websocket);

websocket.onMessage(async (clientId, payload) => {

  const response =
    await runtime.protocol.receive(payload);

  if (response !== undefined) {
    await websocket.send(clientId, response);
  }

  return response;
});

runtime.addEventDispatcher(
  new WebSocketEventDispatcher(server)
);
```

---

## Runtime Lifecycle

```text
Create Runtime
        │
Register Event Dispatchers
        │
Bootstrap Applications
        │
Initialize Runtime
        │
Start Runtime
        │
Accept Client Connections
```

---

## Architecture

```text
          Client
             │
             ▼
      HTTP / WebSocket
             │
             ▼
        JSON-RPC Protocol
             │
             ▼
      StateFlowX Runtime
             │
    ┌────────┴────────┐
    │                 │
 Providers         Services
    │                 │
    └────────┬────────┘
             │
      Runtime Events
             │
             ▼
      WebSocket Stream
```

---

## Related Projects

- StateFlowX Runtime
- StateFlowX Client
- StateFlowX Client Demo

---

## Status

StateFlowX Runtime is experimental and under active development.

The runtime provides a configurable execution engine capable of hosting AI providers, services, transports, protocols, and realtime runtime events. Client applications dynamically register workflows during runtime initialization.
