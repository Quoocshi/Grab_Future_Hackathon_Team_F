import { Crown, UserRound } from "lucide-react";
import type { RoomMember } from "@/types/room";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  members: RoomMember[];
};

export function MemberList({ members }: Props) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Thanh vien phong</h2>
        <Badge variant="secondary">{members.length}/4</Badge>
      </div>
      <div className="mt-4 grid gap-3">
        {members.map((member) => (
          <div key={member.userId} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback>{member.fullName.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{member.fullName}</p>
                <p className="text-xs text-muted-foreground">{member.role === "HOST" ? "Chu phong" : "Joiner"}</p>
              </div>
            </div>
            {member.role === "HOST" ? (
              <Badge className="gap-1">
                <Crown className="size-3" aria-hidden="true" />
                Host
              </Badge>
            ) : (
              <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
