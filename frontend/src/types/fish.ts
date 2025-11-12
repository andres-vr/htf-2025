export interface Fish {
  id: string;
  name: string;
  image: string;
  rarity: string;
  latestSighting: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

export type Rarity = "COMMON" | "RARE" | "EPIC";
