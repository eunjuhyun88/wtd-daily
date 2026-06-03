import adapterVercel from '@sveltejs/adapter-vercel';

const config = {
  kit: {
    adapter: adapterVercel({
      runtime: 'nodejs22.x',
    }),
  }
};

export default config;
