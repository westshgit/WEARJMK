import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Copy, Check, ArrowUpRight } from "lucide-react";
// Swap for your Remix Icons: RiMapPin2Line, RiTimeLine, RiFileCopyLine, RiCheckLine, RiArrowRightUpLine

function getStatus(opens: number, closes: number) {
  const hour = new Date().getHours() + new Date().getMinutes() / 60;
  const isOpen = hour >= opens && hour < closes;
  const fmt = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? "PM" : "AM"}`;
  return {
    isOpen,
    label: isOpen ? `Open · closes ${fmt(closes)}` : `Closed · opens ${fmt(opens)}`,
  };
}

interface Store {
  id: string;
  name: string;
  address: string;
  opens: number;
  closes: number;
}

function StoreCard({ store }: { store: Store }) {
  const [copied, setCopied] = useState(false);
  const status = getStatus(store.opens, store.closes);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    store.address
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(store.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <Card className="w-full max-w-sm shrink-0 snap-start">
      <div className="flex items-start justify-between gap-3">
        <h5 className="font-serif text-lg text-[#221d17]">{store.name}</h5>
        <span
          className={`mt-1 flex items-center gap-1.5 whitespace-nowrap text-[11px] tracking-wide ${
            status.isOpen ? "text-[#6b7c5c]" : "text-[#a08a6b]"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status.isOpen ? "bg-[#6b7c5c]" : "bg-[#a08a6b]"
            }`}
          />
          {status.label}
        </span>
      </div>

      <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-[#5a5348]">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a876]" />
        {store.address}
      </p>

      <p className="mt-2 flex items-center gap-2 text-xs text-[#8a8276]">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        {store.opens}:00 – {store.closes}:00 daily
      </p>

      <div className="mt-4 flex gap-2 border-t border-[#e7e1d6] pt-4">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 border border-[#221d17] py-2 text-xs uppercase tracking-wide text-[#221d17] transition-colors hover:bg-[#221d17] hover:text-[#fdfcfa]"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy address
            </>
          )}
        </button>

        <a
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 bg-[#221d17] py-2 text-xs uppercase tracking-wide text-[#fdfcfa] transition-colors hover:bg-[#3a3226]"
        >
          View on map <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </Card>
  );
}

export default function VisitUs({ store }: { store: Store[] }) {
  return (
    <div className="space-y-5">
      <h4 className="text-3xl">Visit Us</h4>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-scroll [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
        {store.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}
