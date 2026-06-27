"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { searchAddresses } from "@/lib/api/address";
import type { Address, SelectedPlace } from "@/types/address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  value: SelectedPlace | null;
  onChange: (place: SelectedPlace | null) => void;
  placeholder: string;
};

function toSelectedPlace(address: Address): SelectedPlace {
  return {
    label: address.label,
    fullAddress: address.fullAddress,
    lat: address.latitude,
    lng: address.longitude,
    h3Index: address.h3Index,
    kind: address.kind,
  };
}

export function AddressAutocomplete({ id, label, value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const { data = [], isFetching, isError } = useQuery({
    queryKey: ["addresses", debounced],
    queryFn: () => searchAddresses(debounced, 8),
    enabled: open,
  });

  const suggestions = useMemo(() => data.slice(0, 8), [data]);

  return (
    <div ref={wrapperRef} className="relative grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (value) onChange(null);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-11 pl-10 pr-10"
        />
        {isFetching ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            aria-label="Clear address"
            onClick={() => {
              setQuery("");
              onChange(null);
            }}
          >
            <X className="size-4" />
          </Button>
        ) : null}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border bg-popover shadow-lg">
          {isError ? (
            <div className="p-4 text-sm text-destructive">Khong tai duoc dia diem.</div>
          ) : suggestions.length === 0 && debounced ? (
            <div className="p-4 text-sm text-muted-foreground">Khong tim thay dia diem phu hop.</div>
          ) : (
            <div className="max-h-72 overflow-auto p-1">
              {suggestions.map((address) => (
                <button
                  key={address.id}
                  type="button"
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                  )}
                  onClick={() => {
                    setQuery(address.label);
                    onChange(toSelectedPlace(address));
                    setOpen(false);
                  }}
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium">{address.label}</span>
                      <Badge variant="outline" className="shrink-0">
                        {address.kind}
                      </Badge>
                    </span>
                    <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {address.fullAddress}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
