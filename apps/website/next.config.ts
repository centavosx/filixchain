import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    config.experiments = {
      layers: true,
      asyncWebAssembly: true,
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
