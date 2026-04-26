# 📰 News Hub - A Modern News Publishing Platform

A full-featured news publishing platform built with modern web technologies. News Hub allows users to read, create, comment on, and engage with news articles in real-time with a beautiful, intuitive interface.

## ✨ Features

### For Readers
- 📖 Browse news articles by categories
- ❤️ Like/dislike articles and comments
- 💬 Comment on articles with threaded discussions
- 🔖 Bookmark articles for later reading
- 📊 Track reading history
- 🔍 Search functionality
- 🌙 Dark mode support
- 📱 Fully responsive design

### For Authors/Content Creators
- ✍️ Create and publish news articles with rich text editor
- 🖼️ Upload and manage article thumbnails
- 📝 Draft and schedule articles
- 📊 View article analytics and engagement metrics
- ✏️ Edit and manage published content
- 🏷️ Organize articles by categories

### For Administrators
- 🎛️ Admin dashboard with analytics
- 👥 User management and role assignment
- 📰 News moderation and approval workflow
- 📈 View comprehensive analytics:
  - Daily article statistics
  - User engagement metrics
  - Traffic insights
  - Content performance

### Core Features
- 🔐 Secure authentication with NextAuth.js (OAuth & email/password)
- 🔄 Real-time view counters
- ⚡ Rate limiting to prevent abuse
- 📧 Email notifications via Resend
- 🖼️ Image optimization with Cloudinary
- 🗂️ PostgreSQL database with Prisma ORM
- 🚀 SEO optimized with auto-generated sitemap
- 🎨 Beautiful UI with Radix UI & Tailwind CSS
- ⚙️ TypeScript for type safety

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.9 with App Router
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS 4.1
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Rich Text Editor**: TipTap
- **Icons**: Iconify React
- **Carousel**: Embla Carousel
- **Charts**: Recharts
- **HTTP Client**: React Query (TanStack Query)
- **Notifications**: Sonner & React Email

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js 4.24
- **API**: Next.js API Routes

### Infrastructure & Services
- **Hosting**: Vercel
- **Database Acceleration**: Prisma Accelerate
- **CDN & Image Hosting**: Cloudinary
- **Cache & Rate Limiting**: Upstash Redis
- **Email Service**: Resend
- **SEO**: next-sitemap

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18 or higher
- npm or yarn
- PostgreSQL database (or use Prisma Postgres)

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd news-hub
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_key_min_32_characters"

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Email Service
RESEND_API_KEY="your_resend_api_key"

# Image Management
CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Redis Cache & Rate Limiting
UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"
```

### 4. Set Up the Database

```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed the database with sample data (optional)
npm run seed
```

### 5. Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📁 Project Structure

```
news-hub/
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── (auth)/            # Authentication routes (login, register, etc.)
│   │   ├── admin/             # Admin dashboard and management
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable React components
│   │   ├── ui/               # UI components (buttons, forms, etc.)
│   │   ├── articles/         # Article-related components
│   │   ├── admin/            # Admin-specific components
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and helpers
│   └── middleware.ts         # Next.js middleware
├── prisma/
│   ├── schema.prisma         # Database schema definition
│   ├── migrations/           # Database migrations
│   └── seed.ts              # Database seeding script
├── public/                   # Static assets
├── .env                     # Environment variables (not committed)
├── .env.example             # Example environment variables
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## 🗄️ Database Schema

### Main Models

**User**
- User accounts with roles (READER, AUTHOR, ADMIN)
- Authentication accounts and sessions
- User profile information

**News**
- News articles with rich content
- Status tracking (DRAFT, PUBLISHED, REJECTED)
- Metadata (title, slug, excerpt, thumbnails)
- Author and category relationships
- Engagement metrics (views, likes, comments)

**Comment**
- Threaded comments on news articles
- Comment likes/dislikes
- Author tracking

**Category**
- News categories for organization
- Category-specific article management

**Other Models**
- NewsLike, CommentLike - Engagement tracking
- Bookmark - User's saved articles
- ViewLog - Article view analytics
- History - Reading history
- ContentImage - Images within article content
- PasswordReset - Password recovery tokens

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack

# Production
npm run build           # Build for production with Turbopack
npm start              # Start production server

# Code Quality
npm run lint           # Run ESLint

# Database
npm run seed           # Seed database with sample data
npm run reply          # Run Prisma reply script (development tool)

# SEO
npm run postbuild      # Generate sitemap after build
```

## 🔐 Authentication

The application uses NextAuth.js with multiple authentication methods:

- **Google OAuth**: Sign in with Google account
- **Email/Password**: Traditional email and password authentication
- **Session Management**: Secure session handling with database persistence

### Protected Routes
- Admin dashboard (`/admin/*`)
- User profile pages
- Article creation and editing
- Comment management

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `POST /api/auth/reset-password` - Request password reset

### Articles (News)
- `GET /api/news` - Get all articles
- `GET /api/news/[id]` - Get single article
- `POST /api/news` - Create new article (authors)
- `PUT /api/news/[id]` - Update article
- `DELETE /api/news/[id]` - Delete article

### Comments
- `GET /api/news/[id]/comments` - Get article comments
- `POST /api/news/[id]/comments` - Add comment
- `PUT /api/comments/[id]` - Update comment
- `DELETE /api/comments/[id]` - Delete comment

### Analytics (Admin)
- `GET /api/admin/analytics` - Overall statistics
- `GET /api/admin/analytics/daily` - Daily metrics
- `GET /api/admin/analytics/insights` - Content insights
- `GET /api/admin/analytics/overview` - Dashboard overview

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)

## 🎨 UI Components

Built with Radix UI and Tailwind CSS, featuring:
- Responsive buttons and forms
- Modal dialogs
- Dropdown menus
- Checkboxes and switches
- Scroll areas
- Avatar components
- And more...

All components follow accessibility best practices and support dark mode.

## 📊 Analytics Features

The admin dashboard provides:
- **Real-time Statistics**: Article views, comments, likes
- **Daily Metrics**: Trending articles and user engagement
- **User Insights**: Active users, engagement trends
- **Content Performance**: Most viewed articles, trending content
- **Custom Charts**: Visual representation of key metrics

## 🚀 Deployment

### Vercel (Recommended)
The app is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
docker build -t news-hub .
docker run -p 3000:3000 news-hub
```

### Manual Deployment
1. Build the app: `npm run build`
2. Start the server: `npm start`
3. Ensure all environment variables are set on the hosting platform

## 📝 Environment Setup Tips

### For Local Development
- Use `localhost:3000` for `NEXTAUTH_URL`
- Generate a secure `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Use ngrok or similar for testing OAuth locally

### For Production
- Always use HTTPS URLs
- Set secure cookies in NextAuth configuration
- Use strong, randomly generated secrets
- Keep sensitive credentials in environment variables only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check Prisma logs: `npx prisma db execute --stdin`

### NextAuth Issues
- Ensure NEXTAUTH_SECRET is set (minimum 32 characters)
- Verify OAuth credentials are correct
- Check NEXTAUTH_URL matches your current host

### Image Upload Issues
- Verify Cloudinary credentials
- Check image size limits
- Ensure proper CORS configuration

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Run `npx prisma generate` to regenerate Prisma client

## 📚 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Radix UI Documentation](https://radix-ui.com/)
- [TipTap Editor Documentation](https://tiptap.dev/)

## 🎯 Future Enhancements

Planned features for future releases:
- [ ] Advanced search with filters
- [ ] Article recommendations
- [ ] Newsletter subscription
- [ ] Social media sharing integrations
- [ ] Image cropping tool
- [ ] Comment moderation tools
- [ ] User notifications
- [ ] Mobile app version

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ by Faisal Yulianto**
