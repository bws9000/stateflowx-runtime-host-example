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