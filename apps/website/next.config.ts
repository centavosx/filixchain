import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    // Enable WebAssembly for client-side and server-side (if needed)
    config.experiments = {
      layers: true,
      asyncWebAssembly: true, // Enables async WebAssembly
      syncWebAssembly: true, // Enables sync WebAssembly (for older compatibility)
    };

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
