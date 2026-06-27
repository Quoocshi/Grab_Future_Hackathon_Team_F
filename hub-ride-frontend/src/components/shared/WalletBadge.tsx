"use client";

import { WalletCards } from "lucide-react";
import { useUserStore } from "@/lib/store/userStore";
import { formatVnd } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

export function WalletBadge() {
  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <Badge variant="secondary" className="hidden h-9 gap-2 px-3 sm:inline-flex">
      <WalletCards className="size-4" aria-hidden="true" />
      {formatVnd(currentUser.walletBalance)}
    </Badge>
  );
}
