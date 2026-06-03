import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    external: ['pg-native'],
  },
  build: {
    rollupOptions: {
      external: [
        'pg-native',
        '@walletconnect/ethereum-provider',
        '@metamask/sdk',
        '@coinbase/wallet-sdk',
        '@phantom/browser-sdk',
        '@base-org/account',
        '@privy-io/js-sdk-core',
        'lightweight-charts',
        'pixi.js',
        'viem',
        'viem/chains',
        'stripe',
        'cloudflare:sockets',
      ],
    },
  },
});
