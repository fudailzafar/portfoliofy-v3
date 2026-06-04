<div align="center">
  <img alt="Portfoliofy Logo" src="./public/opengraph-image.png" width="100%">
  <br/>
  <h1>Portfoliofy</h1>
  <p>A progressive platform used by thousands of people to create more mindful professional profiles.</p>
</div>

---

## ⚡️ Overview

Portfoliofy allows users to effortlessly build beautiful, responsive, and highly customizable online portfolios in seconds using a dynamic drag-and-drop editor.

Users get a custom profile link (`portfoliofy.me/username`), dynamic social media sharing images (Open Graph), and global discoverability via the Explore network.

## 🛠️ Tech Stack

This project uses a modern, scalable full-stack architecture:

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: [Supabase PostgreSQL](https://supabase.com/) with `postgres.js`
- **Authentication**: [NextAuth.js v5 (Auth.js)](https://authjs.dev/)
- **File Storage**: [AWS S3](https://aws.amazon.com/s3/) (for PDFs and Custom Avatars)
- **State Management**: [React Query](https://tanstack.com/query) + [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Hosting**: [Vercel](https://vercel.com/)

## ✨ Key Features

- **Drag & Drop Editor**: Rearrange sections of your portfolio seamlessly using `@dnd-kit`.
- **Dynamic Styling**: Toggle between custom typography (Sans, Serif, Mono) and theme palettes (Default, Dark, minimal, etc.) instantly.
- **Explore Network**: Discover other professionals on the platform with real-time search and smart sorting (Activity, New, A-Z).
- **Dynamic Open Graph Images**: Automatically generates beautiful, rounded social media preview cards for every profile using `@next/og`.
- **Split-Pane Navigation**: Seamlessly browse other portfolios directly from the sidebar without hard refreshing the page.

## 🚀 Getting Started

### Prerequisites

Ensure you have created accounts and obtained API keys for the following services:

- [Supabase](https://supabase.com/) (PostgreSQL Database)
- [AWS](https://aws.amazon.com/) (S3 Bucket)
- Google Cloud Console (OAuth Credentials for NextAuth)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/portfoliofy.git
cd portfoliofy
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup Environment Variables

Rename `.env.local.example` (or create a new `.env.local` file) in the root of the project and populate it with your keys:

```env
# AWS S3 (File Storage)
S3_UPLOAD_BUCKET="portfoliofy"
S3_UPLOAD_KEY="your_aws_key"
S3_UPLOAD_SECRET="your_aws_secret"
S3_UPLOAD_REGION="us-east-1"

# Database (Supabase Pooler URL)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres"

# NextAuth Configuration
AUTH_SECRET="generate_a_random_base64_string"
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_secret"
```

_(Note: Ensure you are using the Supabase Transaction Pooler URL on port `6543` for Serverless environments)._

### 4. Initialize the Database

The database requires a specific schema for the `users` and `resumes` tables. Ensure you execute the necessary SQL scripts in your Supabase SQL Editor before running the application.

### 5. Run the development server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running.

## 📝 Future Roadmap

- [ ] Add a rich Markdown/Tiptap blog CMS directly into the portfolios.
- [ ] Implement deeper Analytics (profile views).
- [ ] Add custom domain support for individual users (`username.com`).
- [ ] Add more curated theme palettes (Ghibli, Monokai, Cyberpunk).

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a pull request if you have ideas on how to improve the platform.
