-- CreateTable
CREATE TABLE "DivingCenter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Fish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "rarity" TEXT
);

-- CreateTable
CREATE TABLE "FishSighting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishId" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FishSighting_fishId_fkey" FOREIGN KEY ("fishId") REFERENCES "Fish" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TemperatureSensor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "TemperatureReading" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "temperature" DECIMAL NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperatureSensorId" TEXT NOT NULL,
    CONSTRAINT "TemperatureReading_temperatureSensorId_fkey" FOREIGN KEY ("temperatureSensorId") REFERENCES "TemperatureSensor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
