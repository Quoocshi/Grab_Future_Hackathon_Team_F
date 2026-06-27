import type { PartnerQuote } from "@/types/partner";
import { PartnerCard } from "@/components/room/PartnerCard";

type Props = {
  quotes?: PartnerQuote[];
  bestQuote?: PartnerQuote;
};

export function PriceCompare({ quotes = [], bestQuote }: Props) {
  if (!quotes.length) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
        Bang gia partner se xuat hien sau khi countdown ket thuc.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {quotes.map((quote) => (
        <PartnerCard
          key={quote.partner}
          quote={quote}
          best={String(quote.partner) === String(bestQuote?.partner)}
        />
      ))}
    </div>
  );
}
