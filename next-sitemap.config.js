// next-sitemap.config.js
import { PrismaClient } from '@prisma/client'

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://news-hub-iota-silk.vercel.app'

/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl,
  generateRobotsTxt: false,
  exclude: [
    '/admin/*',
    '/author/*',
    '/profile/*',
    '/forbidden',
    '/login',
    '/register',
    '/search-news',
    '/reset-password',
    '/forgot-password',
  ],
  additionalPaths: async () => {
    const prisma = new PrismaClient()
    try {
      const [news, categories] = await Promise.all([
        prisma.news.findMany({
          where: { status: 'PUBLISHED' },
          select: { slug: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 1000,
        }),
        prisma.category.findMany({
          select: { slug: true },
        }),
      ])

      const categoryPaths = categories.map((c) => ({
        loc: `/category/${c.slug}`,
        lastmod: new Date().toISOString(),
        priority: 0.7,
        changefreq: 'daily',
      }))

      const newsPaths = news.map((item) => ({
        loc: `/news/${item.slug}`,
        lastmod: new Date(item.updatedAt).toISOString(),
        priority: 0.8,
        changefreq: 'weekly',
      }))

      return [...categoryPaths, ...newsPaths]
    } catch (error) {
      console.error('Sitemap error:', error)
      return []
    } finally {
      await prisma.$disconnect()
    }
  },
}

export default config