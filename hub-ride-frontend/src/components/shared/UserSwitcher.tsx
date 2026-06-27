"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, UserRound } from "lucide-react";
import { getUsers } from "@/lib/api/user";
import { useUserStore } from "@/lib/store/userStore";
import { formatVnd } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserSwitcher() {
  const { currentUser, setCurrentUser } = useUserStore();
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="max-w-[180px] justify-between">
          <UserRound className="size-4" aria-hidden="true" />
          <span className="truncate">{currentUser.fullName}</span>
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Demo user</DropdownMenuLabel>
        {users.map((user) => (
          <DropdownMenuItem key={user.id} onClick={() => setCurrentUser(user)}>
            <div className="min-w-0">
              <p className="truncate font-medium">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{formatVnd(user.walletBalance)}</p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
