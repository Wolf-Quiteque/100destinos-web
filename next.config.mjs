/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['picsum.photos'],
      },
      transpilePackages: ['react-map-gl']
};

export default nextConfig;
