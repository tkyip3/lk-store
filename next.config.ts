import { withPayload } from '@payloadcms/next/withPayload'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev({})
}

const nextConfig = {
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  turbopack: {
    resolveExtensions: ['.cts', '.cjs', '.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lk-store-production.tkyip3.workers.dev',
      },
    ], // 移除 `as const`
  },
}

export default withPayload(nextConfig as any, { devBundleServerPackages: false })
