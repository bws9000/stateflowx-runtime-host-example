# StateFlowX Runtime Host Demo

Minimal external runtime host example for StateFlowX.

This project demonstrates how to host the StateFlowX runtime outside of the main monorepo using the published npm packages.

## Features

- External npm package consumption
- WebSocket runtime hosting
- JSON-RPC transport
- Dynamic runtime initialization
- Gemini AI provider integration
- Remote workflow registration
- HTTP service orchestration

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
ws://localhost:3000
```

---

## Example Runtime Host

```js
import 'dotenv/config';

import { WebSocketServer } from 'ws';

import {
  createRuntime,
  RuntimeInitializeApp,
  GeminiProvider,
} from '@stateflowx/runtime';

const wss = new WebSocketServer({
  port: 3000,
});

wss.on('connection', (socket) => {
  console.log('Client connected');

  const runtime = createRuntime(
    {
      send(data) {
        socket.send(data);
      },
    },
    {
      apps: [
        new RuntimeInitializeApp(),
      ],

      providers: [
        {
          name: 'default',
          provider: new GeminiProvider(),
        },
      ],

      services: [],
    }
  );

  socket.on('message', async (message) => {
    const payload = JSON.parse(message.toString());

    console.log('MESSAGE:', payload);

    await runtime.receiveAndSend(payload);
  });
});

console.log(
  'StateFlowX runtime listening on ws://localhost:3000'
);
```

---

## Related Projects

- StateFlowX Client Demo
- StateFlowX Runtime
- StateFlowX Client

---

## Architecture

```text
Angular Client
  ->
WebSocket
  ->
JSON-RPC Runtime
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