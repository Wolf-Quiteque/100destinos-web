import withPWAInit from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos'],
      },
      transpilePackages: ['react-map-gl']
};

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // You can add more PWA options here if needed later
});

export default withPWA(nextConfig);
