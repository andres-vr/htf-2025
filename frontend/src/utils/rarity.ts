export const getRarityOrder = (rarity: string): number => {
  switch (rarity.toUpperCase()) {
    case "EPIC":
      return 0;
    case "RARE":
      return 1;
    case "COMMON":
      return 2;
    default:
      return 3;
  }
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity.toUpperCase()) {
    case "RARE":
      return "var(--warning-amber)";
    case "EPIC":
      return "var(--danger-red)";
    default:
      return "var(--sonar-green)";
  }
};

export const getRarityBadgeClass = (rarity: string): string => {
  switch (rarity.toUpperCase()) {
    case "RARE":
      return "bg-warning-amber text-deep-ocean";
    case "EPIC":
      return "bg-danger-red text-deep-ocean";
    default:
      return "bg-sonar-green text-deep-ocean";
  }
};

export const getRarityPulseClass = (rarity: string): string => {
  switch (rarity.toUpperCase()) {
    case "EPIC":
      return "animate-ping-epic"; // Fastest pulse for epic (0.8s)
    case "RARE":
      return "animate-ping-rare"; // Medium pulse for rare (1.2s)
    default:
      return "animate-ping-common"; // Slowest pulse for common (2s)
  }
};
