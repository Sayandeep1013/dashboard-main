// next.config.js
const nextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === "production";

    return [
      {
        source: "/api/:path*",
        destination: isProd
          ? 'https://admin-api.life-lab.org/api/:path*' // production
          : 'http://localhost:5000/api/:path*', // local dev
      },
    ];
  },
};

module.exports = nextConfig;
