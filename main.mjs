import 'dotenv/config';

import {
  bootstrapRuntime,
  createRuntime,
  RuntimeInitializeApp,
  GeminiProvider,
  JsonRpcProtocol,
  WebSocketTransport,
  WebSocketEventDispatcher,
} from '@stateflowx/runtime';

import { WebSocketServer } from 'ws';

//
// WebSocket runtime server
//
const server = new WebSocketServer({
  port: 3001,
});

//
// Transport + protocol
//
const transport =
  new WebSocketTransport(server);

const protocol =
  new JsonRpcProtocol();

//
// Runtime
//
const runtime = createRuntime({
  transport,

  protocol,

  providers: [
    {
      name: 'gemini',

      provider:
        new GeminiProvider(),
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
});

//
// Runtime event dispatcher
//
const dispatcher =
  new WebSocketEventDispatcher(
    server
  );

runtime.events.on(
  '*',

  async (event) => {
    await dispatcher.dispatch(
      event
    );
  }
);

//
// Register runtime apps/workflows
//
bootstrapRuntime(
  [
    new RuntimeInitializeApp(),
  ],

  runtime
);

console.log(
  'StateFlowX runtime listening on ws://localhost:3001'
);