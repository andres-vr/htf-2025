import { fetchFishes } from "@/api/fish";
import { getRarityOrder } from "@/utils/rarity";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FishTrackerLayout from "@/components/FishTrackerLayout";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const fishes = await fetchFishes();

  // Sort fish by rarity (rarest first)
  const sortedFishes = [...fishes].sort(
    (a, b) => getRarityOrder(a.rarity) - getRarityOrder(b.rarity)
  );

  return <FishTrackerLayout fishes={fishes} sortedFishes={sortedFishes} />;
}
