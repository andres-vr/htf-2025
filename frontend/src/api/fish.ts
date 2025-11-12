export const fetchFishes = async () => {
  const response = await fetch("http://localhost:5555/api/fish");
  const data = await response.json();
  return data;
};
