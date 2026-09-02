# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Changes that have landed on `main` but haven't been tagged as a release yet
go here. Move them under a new version heading below when you cut a release.

### Added

### Changed

### Fixed

## [0.1.0] - 2026-09-02

Initial build-out, from project scaffolding through the current feature set.
Grouped by feature area rather than by commit — see `git log` for the full,
chronological history.

### Added

**Profile builder**

- Drag-and-drop resume editor with section reordering
- Resume sections: Work Experience, Education, Side Projects, Speaking, Skills, Contact, Features, Volunteering, Awards, Certifications, Writing, Exhibitions
- Rich text descriptions, per-item visibility toggling, and move up/down reordering across all list sections
- Collaborator tagging across resume sections, with search and display
- Media attachments (images/video) with upload, reordering, deletion, and lightbox preview
- Custom cover image and favicon upload per profile
- Print-friendly resume view with dynamic section controls
- Dark mode, and a global CSS design-system token layer

**Writing / pages**

- Full page management system: draft/publish toggling, custom dates, centralized editing (`feat!`)
- Image and video embedding in page content, with inline captions and alt-text sync
- Code block syntax highlighting (highlight.js, Material Dark theme)
- Circular next/previous navigation between published posts
- Server-side page persistence and deletion

**Discovery & profiles**

- Explore network: a searchable, sortable directory of profiles with infinite scroll
- Username claiming flow with real-time validation, normalization, and reserved-word enforcement
- Public empty-profile and 404 states, including an interactive emoji 404 page
- User status editor, shown in the profile header
- Page-view Insights tab (Recharts)

**Domains & SEO**

- Per-user subdomains (`username.portfoliofy.me`) and custom domain support, with ownership verification
- Dynamic, host-aware `sitemap.xml` and `robots.txt`
- Open Graph image generation per profile and per page, plus JSON-LD structured metadata
- `llms.txt` generation for AI crawlers
- Canonical URL resolution across custom domains and subdomains
- Google Analytics and Vercel Analytics/Speed Insights

**Data & infrastructure**

- AI-assisted resume import from PDF (Gemini + `pdf-parse`)
- Migrated persistence from Redis to PostgreSQL (Supabase), with a shared database-actions layer
- PWA support (service worker, web manifest)
- Vitest unit test suite

### Changed

- Migrated theming and component styling onto semantic CSS design tokens
- Replaced in-memory rate limiting with Upstash Redis across API routes
- Centralized site-domain configuration behind a single environment-driven constant (`refactor!`)

### Security

- Strict Content-Security-Policy and server-side sanitization of rich-text input to prevent XSS
- Custom-domain input sanitized; avatar URLs restricted to trusted S3 buckets
- S3 uploads scoped to the authenticated user with file-type validation

[unreleased]: https://github.com/fudailzafar/portfoliofy-v3/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fudailzafar/portfoliofy-v3/releases/tag/v0.1.0
