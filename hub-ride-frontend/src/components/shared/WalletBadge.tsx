"use client";

import { WalletCards } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "@/lib/store/userStore";
import { formatVnd } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

export function WalletBadge() {
  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <Badge id="tour-wallet" variant="secondary" className="hidden h-9 gap-2 px-3 sm:inline-flex">
      <WalletCards className="size-4" aria-hidden="true" />
      <motion.span
        key={currentUser.walletBalance}
        initial={{ scale: 1.25, opacity: 0.55 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.28 }}
        className="tabular-nums"
      >
        {formatVnd(currentUser.walletBalance)}
      </motion.span>
    </Badge>
  );
}
