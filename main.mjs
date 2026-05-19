import { WebSocketServer } from "ws";
import 'dotenv/config';

import {
  createRuntime,
  RuntimeInitializeApp,
  GeminiProvider,
} from "@stateflowx/runtime";

const wss = new WebSocketServer({
  port: 3000,
});

wss.on("connection", (socket) => {
  console.log("Client connected");

  const runtime = createRuntime(
    {
      send(data) {
        socket.send(data);
      },
    },
    {
      apps: [new RuntimeInitializeApp()],

      providers: [
        {
          name: "gemini",
          provider: new GeminiProvider(),
        },
      ],

      services: [],
    },
  );

  socket.on("message", async (message) => {
    const payload = JSON.parse(message.toString());

    console.log("MESSAGE:", payload);

    await runtime.receiveAndSend(payload);
  });
});

console.log("StateFlowX runtime listening on ws://localhost:3000");
