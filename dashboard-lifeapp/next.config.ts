const nextConfig = {
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';

    return [
      {
        source: '/api/:path*',
        destination: isProd
          ? 'http://152.42.239.141:5000/api/:path*'   // production
          : 'http://127.0.0.1:5000/api/:path*',       // local dev
      },
    ];
  },
};

module.exports = nextConfig;
