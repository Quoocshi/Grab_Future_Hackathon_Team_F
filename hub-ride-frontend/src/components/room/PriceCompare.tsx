import type { PartnerQuote } from "@/types/partner";
import { PartnerCard } from "@/components/room/PartnerCard";

type Props = {
  quotes?: PartnerQuote[];
  bestQuote?: PartnerQuote;
};

export function PriceCompare({ quotes = [], bestQuote }: Props) {
  if (!quotes.length) {
    return (
      <div id="tour-price-compare" className="rounded-xl border border-dashed bg-card p-6 text-sm text-muted-foreground">
        Partner quotes will appear after the countdown finishes.
      </div>
    );
  }

  return (
    <div id="tour-price-compare" className="grid gap-3">
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
