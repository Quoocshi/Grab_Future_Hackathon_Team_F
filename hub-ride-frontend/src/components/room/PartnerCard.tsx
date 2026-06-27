import { CarFront, Leaf, Zap } from "lucide-react";
import type { PartnerQuote } from "@/types/partner";
import { formatVnd } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  quote: PartnerQuote;
  best?: boolean;
};

const partnerLabel: Record<string, string> = {
  GRAB: "Grab",
  BE: "Be",
  XANH_SM: "Xanh SM",
};

export function PartnerCard({ quote, best }: Props) {
  const Icon = quote.partner === "XANH_SM" ? Leaf : quote.partner === "BE" ? Zap : CarFront;
  const perPerson = quote.perPersonPrice ?? quote.perPerson ?? quote.totalPrice;

  return (
    <Card className={best ? "border-primary ring-primary/30" : undefined}>
      <CardContent className="grid gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-semibold">{partnerLabel[String(quote.partner)] ?? quote.partner}</h3>
              <p className="text-xs text-muted-foreground">{quote.vehicleType ?? "CAR_4"}</p>
            </div>
          </div>
          {best ? <Badge>Best fare</Badge> : null}
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
              <p className="text-muted-foreground">Total</p>
            <p className="mt-1 font-semibold">{formatVnd(quote.totalPrice)}</p>
          </div>
          <div>
              <p className="text-muted-foreground">Per rider</p>
            <p className="mt-1 font-semibold">{formatVnd(perPerson)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">ETA</p>
            <p className="mt-1 font-semibold">{quote.etaMinutes} min</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
