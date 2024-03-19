/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "*.replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "user-images.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pics0.baidu.com",
      },
      {
        protocol: "https",
        hostname: "tuoyifu.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "f005.backblazeb2.com",
      },{
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/replicate/paint-by-text",
        permanent: false,
      },
      {
        source: "/deploy",
        destination: "https://vercel.com/templates/next.js/paint-by-text",
        permanent: false,
      },   
    ]
  }
};

module.exports = nextConfig;
