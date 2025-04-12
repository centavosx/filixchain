import type { NextConfig } from 'next';
import { envSchema } from './config.schema';
import { ZodError } from 'zod';

try {
  const data = envSchema.parse(process.env);
  Object.keys(data).forEach((key) => {
    process.env[key] = data[key as keyof typeof data];
  });
} catch (error) {
  if (error instanceof ZodError) {
    console.error(JSON.stringify(error.errors, null, 2));
    process.exit(1);
  }
  throw error;
}

const nextConfig: NextConfig = {
  output: 'standalone',
  webpack(config, { isServer }) {
    config.experiments = {
      layers: true,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };

    // github.com/vercel/next.js/issues/64792)
    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }

    // If your WebAssembly file is not being handled by default rules, add it to the module rules
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async', // or "webassembly/sync" depending on how you need it
      use: [],
    });

    return config;
  },
};

export default nextConfig;
