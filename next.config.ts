import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import { withPayload } from '@payloadcms/next/withPayload'

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev({})
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js config here
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: { resolveExtensions: ['.cts', '.cjs', '.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs'] },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_PAYLOAD_API, // 或你图床的域名
        // port: '', // 可选
        // pathname: '/**', // 可选
      },
      // 若有其他域名也要加进来
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
