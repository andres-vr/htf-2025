export const fetchFishes = async () => {
  const response = await fetch("http://localhost:5555/api/fish");
  const data = await response.json();
  return data;
};

export const fetchFishByRarity = async (rarity: string) => {
  const response = await fetch(`http://localhost:5555/api/fish/rarity/${rarity}`);
  const data = await response.json();
  return data;
};

export const fetchTemperatureSensors = async (id: string) => {
  const response = await fetch(`http://localhost:5555/api/temperatures/${id}`);
  const data = await response.json();
  return data;
};
