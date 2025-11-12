# Fishy Dex API

A RESTful API backend for the Fishy Dex application, providing endpoints for fish species data, sightings, diving centers, and temperature readings. The API serves as the data layer for tracking aquatic species and managing related geographic and environmental information.

## Overview

Fishy Dex API is a Node.js backend service built with Express.js that powers the Fishy Dex fish tracking application. It provides comprehensive endpoints for accessing fish species catalogs, recording sightings, managing diving center locations, and tracking water temperature data. The API includes scheduled background jobs that automatically update fish sighting and temperature sensor data.

## Technologies

### Core Stack

- **[Express.js 5](https://expressjs.com/)** - Fast, unopinionated web framework for Node.js
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment

### Database & ORM

- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for TypeScript and Node.js
- **[SQLite](https://www.sqlite.org/)** - Lightweight, serverless database engine

### Additional Libraries

- **[CORS](https://github.com/expressjs/cors)** - Express middleware for enabling Cross-Origin Resource Sharing
- **[Turf.js](https://turfjs.org/)** - Geospatial analysis library for geographic calculations

## Setup

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/optis-nv/htf-2025-api
   cd htf-2025-api
   ```

2. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```bash
   touch .env
   ```

   Add the following environment variable:

   ```env
   # Database - SQLite database file location
   DATABASE_URL="file:./dev.db"
   ```

   **Environment Variable Details:**

   - `DATABASE_URL`: Path to the SQLite database file. Defaults to `file:./dev.db` in the `prisma` directory.

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate deploy

   # Seed the database with initial data
   npx prisma db seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Verify the API is running**
   The API will be available at [http://localhost:5555](http://localhost:5555)

### Available Scripts

- `npm run dev` - Start development server with ts-node
- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate deploy` - Run database migrations
- `npx prisma db seed` - Seed the database with initial data
- `npx prisma studio` - Open Prisma Studio for database management

## API Endpoints

### Fish Endpoints

- `GET /api/fish` - Retrieve all fish species
- `GET /api/fish/:id` - Retrieve a specific fish by ID

### Diving Centers

- `GET /api/diving-centers` - Retrieve all diving center locations

### Temperature Readings

- `GET /api/temperatures` - Retrieve all temperature sensor with the latest reading
- `GET /api/temperatures/:id` - Retrieve a specific temperature sensor by ID with all its readings

## Core Features

### Fish Species Management

- Complete catalog of fish species with metadata (name, image, rarity)
- Support for fish rarity classification (Common, Rare, Epic)
- Individual fish lookup by unique identifier

### Sighting Tracking

- Automatic background updates of fish sighting data
- Geographic location tracking for each sighting (latitude/longitude)
- Timestamp recording for all sightings

### Diving Center Locations

- Geographic data for diving center locations
- Coordinate-based location storage (latitude/longitude)

### Temperature Monitoring

- Water temperature readings from sensor networks
- Automatic background updates of temperature sensor data
- Timestamp tracking for all temperature readings
- Geographic association of sensors with coordinates

### Scheduled Background Jobs

- Automatic fish sighting data updates
- Automatic temperature sensor data updates
- Runs continuously while the API server is active

## Database Schema

The API uses Prisma ORM with SQLite and includes the following models:

- **Fish** - Fish species catalog with rarity information
- **FishSighting** - Individual fish sighting records with geographic coordinates
- **DivingCenter** - Diving center location data
- **TemperatureSensor** - Temperature sensor locations
- **TemperatureReading** - Individual temperature readings from sensors
