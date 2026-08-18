# StateFlowX Runtime Host Demo

Minimal standalone runtime host for StateFlowX.

This project demonstrates how to host the StateFlowX Runtime outside the main monorepo using published npm packages.

The host configures runtime infrastructure—including transports, providers, agents, and state storage—while client applications dynamically register services and execution flows.

## Features

- External npm package consumption
- HTTP JSON-RPC hosting
- WebSocket JSON-RPC hosting
- Multi-transport runtime
- Runtime lifecycle management
- Runtime initialization and startup
- Runtime event streaming
- Pluggable provider registration
- Pluggable agent registration
- Pluggable state storage
- Default in-memory store
- Optional MySQL persistence
- Gemini provider support
- OpenAI provider support
- Google ADK provider and agent support
- Realtime observability foundation

---

## Install

```bash
npm install
```

---

## State Store

The runtime host selects the active state store.

Supported implementations currently include:

- `memory`
- `mysql`

The in-memory store is used when `STORE_TYPE` is omitted:

```env
STORE_TYPE=memory
```

To enable persistent MySQL storage:

```env
STORE_TYPE=mysql
```

Client flows may then execute database-independent store actions:

```ts
{
  id: 'save-result',

  type: 'store',

  store: 'mysql',

  operation: 'set',

  key: 'weather:last-result'
}
```

Database credentials remain in the runtime host and are never sent from the browser client.

---

## Environment Variables

Create a `.env` file.

### In-memory store

```env
STORE_TYPE=memory

GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

### MySQL store

```env
STORE_TYPE=mysql

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=stateflowx
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_TABLE=stateflowx_store

GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

The configured MySQL database must already exist.

```sql
CREATE DATABASE IF NOT EXISTS stateflowx;
```

The StateFlowX MySQL store automatically creates its key/value table when the runtime starts.

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

```js
import 'dotenv/config';

import {
  bootstrapHttpRuntime,
  RuntimeInitializeApp,
  GeminiProvider,
  OpenAIProvider,
  MockProvider,
  GoogleAdkProvider,
  GoogleADKAgent,
  WebSocketTransport,
  WebSocketEventDispatcher,
  StoreFactory,
} from '@stateflowx/runtime';

import {
  WebSocketServer,
} from 'ws';

//
// Store
//
const storeType =
  process.env.STORE_TYPE ??
  'memory';

let store;

if (storeType === 'mysql') {
  const mysqlPassword =
    process.env.MYSQL_PASSWORD;

  if (!mysqlPassword) {
    throw new Error(
      'MYSQL_PASSWORD is required when STORE_TYPE=mysql'
    );
  }

  store =
    await StoreFactory.create({
      type: 'mysql',

      host:
        process.env.MYSQL_HOST ??
        'localhost',

      port: Number(
        process.env.MYSQL_PORT ??
        3306
      ),

      database:
        process.env.MYSQL_DATABASE ??
        'stateflowx',

      user:
        process.env.MYSQL_USER ??
        'root',

      password:
        mysqlPassword,

      table:
        process.env.MYSQL_TABLE ??
        'stateflowx_store',
    });
} else if (
  storeType === 'memory'
) {
  store =
    await StoreFactory.create({
      type: 'memory',
    });
} else {
  throw new Error(
    `Unsupported STORE_TYPE: ${storeType}`
  );
}

//
// Google ADK agent
//
const googleAdkAgent =
  new GoogleADKAgent(
    'weather-agent'
  );

//
// HTTP runtime
//
const {
  runtime,
} = await bootstrapHttpRuntime({
  port: 3000,

  store,

  agents: [
    {
      name: 'weather-agent',

      agent: googleAdkAgent,
    },
  ],

  providers: [
    {
      name: 'openai',

      provider:
        new OpenAIProvider(),
    },
    {
      name: 'gemini',

      provider:
        new GeminiProvider(),
    },
    {
      name: 'mock',

      provider:
        new MockProvider(),
    },
    {
      name: 'google-adk',

      provider:
        new GoogleAdkProvider(
          googleAdkAgent
        ),
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

//
// WebSocket transport
//
const server =
  new WebSocketServer({
    port: 3001,
  });

const websocket =
  new WebSocketTransport(
    server
  );

runtime.transports.push(
  websocket
);

websocket.onMessage(
  async (
    clientId,
    payload
  ) => {
    const response =
      await runtime.protocol.receive(
        payload
      );

    if (
      response !== undefined
    ) {
      await websocket.send(
        clientId,
        response
      );
    }

    return response;
  }
);

//
// Runtime event dispatcher
//
runtime.addEventDispatcher(
  new WebSocketEventDispatcher(
    server
  )
);

console.log(`
StateFlowX runtime started

Store
  ${storeType}

HTTP JSON-RPC
  http://localhost:3000/rpc

WebSocket JSON-RPC
  ws://localhost:3001
`);
```

---

## Runtime and Client Responsibilities

The runtime host configures infrastructure:

- Transports
- Protocols
- Provider implementations
- Agent implementations
- State store implementation
- Database connection credentials
- Runtime events and lifecycle

Client applications configure execution:

- Services
- Provider priorities
- Flows
- Actions
- Connectors
- Prompts
- Store operations
- Flow outputs

For example, a client may define:

```text
Weather service
      ↓
Gemini provider
      ↓
MySQL store
      ↓
Notification service
```

The runtime executes the flow using the implementations registered by the host.

---

## Runtime Lifecycle

```text
Create State Store
        │
Create Runtime
        │
Register Providers and Agents
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
       ┌─────────────┼─────────────┐
       │             │             │
   Providers       Agents       Services
       │             │             │
       └─────────────┼─────────────┘
                     │
                 Flow Actions
                     │
                     ▼
               Abstract Store
                     │
              ┌──────┴──────┐
              │             │
           Memory         MySQL
                     │
               Runtime Events
                     │
                     ▼
              WebSocket Stream
```

---

## MySQL Storage Model

StateFlowX uses MySQL as a generic key/value state store.

Example:

```text
store_key                    store_value
------------------------------------------------
weather:last-result          {...}
flow:trip-plan:result        {...}
execution:123:state          {...}
```

Flow actions interact only with the abstract store contract:

```ts
get(key)
set(key, value)
delete(key)
clear()
```

Application flows do not need MySQL-specific queries or connection logic.

---

## Related Projects

- [StateFlowX](https://github.com/bws9000/stateflowx)
- [StateFlowX Runtime](https://www.npmjs.com/package/@stateflowx/runtime)
- [StateFlowX Client](https://www.npmjs.com/package/@stateflowx/client)
- [StateFlowX Common](https://www.npmjs.com/package/@stateflowx/common)
- [Angular Client Demo](https://github.com/bws9000/stateflowx-client-demo)
- [React Client Demo](https://github.com/bws9000/react-stateflowx-demo)

---

## Status

StateFlowX Runtime is experimental and under active development.

The runtime provides a configurable execution environment capable of hosting AI providers, agents, services, transports, protocols, persistent state stores, and realtime runtime events.

Client applications dynamically register flows while the runtime host remains independent of application-specific orchestration.
