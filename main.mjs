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
} from '@stateflowx/runtime';

import { WebSocketServer } from 'ws';

//
// Google ADK agent
//
const googleAdkAgent =
  new GoogleADKAgent('weather-agent');

//
// HTTP runtime
//
const {
  runtime,
} = await bootstrapHttpRuntime({

  agents: [
    {
      name: 'weather-agent',
      agent: googleAdkAgent,
    },
  ],

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
    {
      name: 'google-adk',
      provider: new GoogleAdkProvider(
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
const server = new WebSocketServer({
  port: 3001,
});

const websocket =
  new WebSocketTransport(server);

//
// Register WebSocket transport
//
runtime.transports.push(websocket);

websocket.onMessage(async (clientId, payload) => {

  const response =
    await runtime.protocol.receive(payload);

  if (response !== undefined) {
    await websocket.send(clientId, response);
  }

  return response;
});

//
// Runtime event dispatcher
//
runtime.addEventDispatcher(
  new WebSocketEventDispatcher(server)
);

console.log(`
StateFlowX runtime started

HTTP JSON-RPC
  http://localhost:3000/rpc

WebSocket JSON-RPC
  ws://localhost:3001

WebSocket clients support realtime runtime events.
HTTP clients support request/response execution.
`);