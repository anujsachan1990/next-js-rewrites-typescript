/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'User-Agent',
            value: 'CRGAPP-AU-CR',
          },
        ],
      }
    ]
  }
}

module.exports = nextConfig
