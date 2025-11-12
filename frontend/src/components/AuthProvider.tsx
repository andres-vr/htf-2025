"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function UserInfo() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="text-text-secondary">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          redirect("/");
        },
      },
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-text-primary">
        <p className="font-medium">{session.user.name}</p>
        <p className="text-sm text-text-secondary">{session.user.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 bg-danger-red text-text-primary rounded-md hover:bg-danger-red/80 focus:outline-none focus:ring-2 focus:ring-danger-red transition"
      >
        Sign Out
      </button>
    </div>
  );
}
