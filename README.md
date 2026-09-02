<div align="center">
  <img alt="Portfoliofy Logo" src="./public/opengraph-image.png" width="100%">
  <br/>
  <h1>Portfoliofy</h1>
  <p>A drag-and-drop portfolio builder for professionals — customizable sections, integrated writing, and profiles that are genuinely yours.</p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/fudailzafar/portfoliofy-v3/actions/workflows/ci.yml"><img src="https://github.com/fudailzafar/portfoliofy-v3/actions/workflows/ci.yml/badge.svg" alt="CI Badge"/></a>
    <a href="./LICENSE"><img src="https://img.shields.io/github/license/fudailzafar/portfoliofy-v3?style=flat-square" alt="License Badge"/></a>
    <a href="https://github.com/fudailzafar/portfoliofy-v3/stargazers"><img src="https://img.shields.io/github/stars/fudailzafar/portfoliofy-v3?style=flat-square" alt="Stars Badge"/></a>
    <a href="https://github.com/fudailzafar/portfoliofy-v3/network/members"><img src="https://img.shields.io/github/forks/fudailzafar/portfoliofy-v3?style=flat-square" alt="Forks Badge"/></a>
    <a href="https://github.com/fudailzafar/portfoliofy-v3/pulls"><img src="https://img.shields.io/github/issues-pr/fudailzafar/portfoliofy-v3?style=flat-square" alt="Pull Requests Badge"/></a>
    <a href="https://github.com/fudailzafar/portfoliofy-v3/issues"><img src="https://img.shields.io/github/issues/fudailzafar/portfoliofy-v3?style=flat-square" alt="Issues Badge"/></a>
  </p>
</div>

---

## Overview

**Portfoliofy** allows users to effortlessly build beautiful, responsive, and highly customizable online portfolios in seconds using a dynamic drag-and-drop editor.

Users get a custom profile link (`portfoliofy.me/username`), dynamic social media sharing images (Open Graph), and global discoverability via the Explore network.

## Key Features

- **Drag & Drop Editor**: Rearrange sections of your portfolio seamlessly using `@dnd-kit`.
- **Rich Text Editing**: Integrated `Tiptap` for rich, interactive text formatting within portfolio sections.
- **Dynamic Styling**: Toggle between custom typography (Sans, Serif, Mono) and theme palettes (Default, Dark, minimal, etc.) instantly.
- **Explore Network**: Discover other professionals on the platform with real-time search and smart sorting (Activity, New, A-Z).
- **Dynamic Open Graph Images**: Automatically generates beautiful, rounded social media preview cards for every profile using `@next/og`.
- **Split-Pane Navigation**: Seamlessly browse other portfolios directly from the sidebar without hard refreshing the page.

## Tech Stack

This project uses a modern, scalable full-stack architecture:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: [Supabase PostgreSQL](https://supabase.com/) with `postgres.js`
- **Authentication**: [NextAuth.js v5 (Auth.js)](https://authjs.dev/) with Google OAuth
- **Image Storage**: [AWS S3](https://aws.amazon.com/s3/) (for Custom Avatars)
- **State Management**: [React Query](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) + `framer-motion`
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Hosting**: [Vercel](https://vercel.com/)

## Project Structure

```text
.
├── app/
│   ├── (marketing)/    # Landing page and marketing routes
│   ├── [username]/     # Dynamic user profile and editor routes
│   ├── actions/        # Server actions
│   ├── api/            # Next.js API Routes (Auth, S3, Resume sync, Explore, Domains)
│   ├── auth/           # Post-login handling
│   └── layout.tsx      # Root application layout
├── components/         # Reusable UI components (Shadcn, layouts, etc.)
├── hooks/              # Custom React hooks (e.g., useTabEditor)
├── lib/                # Utility functions, database logic, resume schema
├── store/              # Zustand global state stores
└── public/             # Static assets, fonts, and Open Graph images
```

> Note: the "Explore" discovery network isn't a separate route — it's an in-app sidebar panel (`components/layout/ExploreSidebar.tsx`) backed by `app/api/explore/`.

> **Note for Developers**: For a deep dive into the architecture, component patterns, and a step-by-step guide on adding new features, please read our [Architecture & Developer Guide](./ARCHITECTURE.md).

## Getting Started

### Prerequisites

Ensure you have created accounts and obtained API keys for the following services:

- [Supabase](https://supabase.com/) (PostgreSQL Database)
- [AWS](https://aws.amazon.com/) (S3 Bucket for avatar/file uploads)
- Google Cloud Console (OAuth Credentials for NextAuth)

### 1. Clone the repository

```bash
git clone https://github.com/fudailzafar/portfoliofy-v3.git
cd portfoliofy-v3
```

### 2. Install dependencies

We use `pnpm` as our package manager.

```bash
npm install -g pnpm
pnpm install
```

### 3. Setup Environment Variables

Rename `.example.env` to `.env.local` in the root of the project and populate it with your keys:

```env
# AWS S3 (File Storage)
S3_UPLOAD_BUCKET="portfoliofy"
S3_UPLOAD_KEY="your_aws_key"
S3_UPLOAD_SECRET="your_aws_secret"
S3_UPLOAD_REGION="us-east-1"
NEXT_PUBLIC_CDN_URL="your_cloudfront_or_cdn_url" # Optional

# Database (Supabase Pooler URL)
# Ensure you are using the Transaction Pooler URL on port 6543
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_key"

# NextAuth Configuration
AUTH_SECRET="generate_a_random_base64_string"
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_secret"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"

# Custom Domains (Vercel API — needed for the Personal Domain feature)
VERCEL_API_TOKEN="your_vercel_api_token"
VERCEL_PROJECT_ID="your_vercel_project_id"

# Analytics (Optional)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

See `.example.env` for the full, authoritative list of environment variables.

### 4. Initialize the Database

The database requires a specific schema for the `users` and `resumes` tables. Ensure you execute the necessary SQL scripts in your Supabase SQL Editor before running the application.

### 5. Run the development server

```bash
# Run local development server
pnpm run dev

# Run linting
pnpm lint

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

## Contributing

Contributions are always welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup steps, code style, and the pull request process.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
