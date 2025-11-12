# Fishy Dex

A comprehensive fish tracking application that serves as your personal aquatic species catalog. Track, identify, and catalog aquatic species while exploring fish sighting data, temperatures, and geographic patterns.

## Overview

Fishy Dex is a web-based application designed for fish enthusiasts, marine biologists, and casual observers to maintain a personal catalog of fish species they've encountered. The application provides an intuitive interface for tracking fish sightings, viewing species information, and exploring aquatic data visualizations.

## Technologies

### Core Stack

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework

### Database & ORM

- **[Drizzle ORM](https://orm.drizzle.team/)** - TypeScript ORM
- **[Better SQLite3](https://github.com/WiseLibs/better-sqlite3)** - Fast SQLite3 database

### Authentication

- **[Better Auth](https://www.better-auth.com/)** - Modern authentication solution

### Mapping & Visualization

- **[MapLibre GL](https://maplibre.org/)** - Open-source mapping library
- **[React Map GL](https://visgl.github.io/react-map-gl/)** - React wrapper for MapLibre

### Additional Libraries

- **[date-fns](https://date-fns.org/)** - Modern date utility library
- **[react-resizable-panels](https://github.com/bvaughn/react-resizable-panels)** - Resizable panel components

## Setup

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/optis-nv/htf-2025-nextjs
   cd htf-2025-nextjs
   ```

2. **Configure environment variables**

   Create a `.env` file in the root directory by copying the example file:

   ```bash
   cp .env.example .env
   ```

   Update the following environment variables as needed:

   ```env
   # Better Auth - Authentication configuration
   BETTER_AUTH_SECRET=your-secret-key-change-this-in-production
   BETTER_AUTH_URL=http://localhost:3000

   # Database - SQLite database file location
   DATABASE_URL=./sqlite.db
   ```

   **Environment Variable Details:**

   - `BETTER_AUTH_SECRET`: Secret key used for signing tokens and encrypting session data. **Important:** Change this to a secure random string in production.

   - `BETTER_AUTH_URL`: The base URL where your application is accessible. Use `http://localhost:3000` for local development, and update to your production domain when deploying.

   - `DATABASE_URL`: Path to the SQLite database file. Defaults to `./sqlite.db` in the project root.

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up the database**

   ```bash

   # Run migrations
   npm run db:migrate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server (runs migrations first)
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle migration files
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio for database management

## Core Features

### Fish Species Catalog

- Display a complete catalog of available fish species from the API
- Visual indication system to differentiate between spotted and unseen fish
- Different visual states (colored vs grayscale, badges, checkmarks) showing completion status
- Filtering options to view all fish, only seen fish, or only unseen fish

### Sighting Management

- Interactive functionality to manually record fish sightings
- Simple, intuitive UI to toggle the "seen" status of any fish species
- Persistent storage of sighting data
- Visual feedback when marking a fish to confirm the action

## Future Enhancements

### Photo Upload System

- Allow users to attach photographic evidence when marking a fish as seen
- Support common image formats (JPEG, PNG, WebP)
- Store photos either locally or integrate with cloud storage (S3, Cloudinary, etc.)
- Display thumbnails in the fish details or user profile

### AI-Powered Verification

- Integrate computer vision AI to analyze uploaded photos
- Automatically verify if the uploaded photo actually contains the claimed fish species
- Provide confidence scores for AI identifications
- Prevent false or accidental sightings by requiring minimum confidence thresholds

### Visual Data Representation

- Build custom charts and graphs showing sighting patterns separate from the live API data
- Timeline of when different fish were spotted
- Geographic maps showing where sightings occurred
- Progress charts showing percentage of total fish catalog completed
- Monthly/yearly sighting statistics
- Use charting libraries like Chart.js, Recharts, or D3.js

### Social Features

- **Friend System**

  - Friend discovery and invitation mechanisms
  - Privacy controls for sharing sighting data
  - Activity feed showing friends' recent sightings
  - Real-time or periodic updates of friend activities
  - Ability to like, comment, or react to friends' sightings
  - Notifications for friend achievements

- **Gamification & Leaderboards**

  - Track and rank users based on number of unique fish spotted
  - Different leaderboard categories (weekly, monthly, all-time, regional)
  - Achievement badges for milestones (first sighting, 10 fish, 50 fish, rare species, etc.)
  - Points system including factors like sighting rarity, verification status, photo quality

- **Sharing & Notifications**
  - Push notification system to alert friends when you spot rare or interesting fish
  - Progressive Web App (PWA) implementation for mobile-like notifications on web
  - Share sightings to social media platforms

### Historical Data Analysis

- Display historic data from fish species
- Historical sighting locations and migration patterns
- Leverage API-provided historical data for insights

### Temperature Data Integration

- Display water temperature readings associated with fish sightings
- Correlate fish species with preferred temperature ranges
- Track temperature changes over time
- Geographic heatmaps showing water temperatures across different regions
- Overlay fish sighting data on temperature maps to show correlations
- Interactive maps where users can explore temperature zones and associated fish species

### Ranking and Quiz System

- **User Ranking**: Progressive ranking system (Beginner/Intermediate/Expert/Master) based on experience points (XP) or achievements
- **Picture Quiz**: Educational quiz feature using fish images from the database
  - Multiple choice or identification-based questions
  - Award XP for correct answers, with bonus points for speed
  - Difficulty levels that scale with user rank
  - Daily challenges or quiz streaks for additional engagement
  - Learning mode that provides information about fish after each question
