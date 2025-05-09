/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'avatar.vercel.sh'],
  },
  experimental: {
    serverActions: true,
  },
  middleware: {
    skipMiddlewareUrlNormalize: true,
  },
};

export default nextConfig;
