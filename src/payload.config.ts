import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, Plugin } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Product'
import { Category } from './collections/Category'
import { en, enTranslations } from '@payloadcms/translations/languages/en'
import { zh, zhTranslations } from '@payloadcms/translations/languages/zh'
import { zhTw, zhTwTranslations } from '@payloadcms/translations/languages/zhTw'

//import migrations from './db/migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const isCLI = process.argv.some((value) => value.match(/^(generate|migrate):?/))
const isProduction = process.env.NODE_ENV === 'production'

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

const productPlugin: Plugin = (config) => {
  config.collections = [...config.collections, Products, Category]
  return config
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media /* Products */],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
  }),
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
    productPlugin,
  ],
  i18n: {
    supportedLanguages: { en, zh, 'zh-TW': zhTw },
    fallbackLanguage: 'en',
    translations: {
      en: enTranslations,
      zh: { ...zhTranslations },
      'zh-TW': {
        ...zhTwTranslations,
      },
    },
  },
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: '繁體中文', code: 'zh-hk', fallbackLocale: 'en' },
      { label: '简体中文', code: 'zh-cn', fallbackLocale: 'zh-hk' },
    ],
    defaultLocale: 'zh-hk',
    fallback: true,
  },
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: true,
        // remoteBindings: isProduction,
      } satisfies GetPlatformProxyOptions),
  )
}
