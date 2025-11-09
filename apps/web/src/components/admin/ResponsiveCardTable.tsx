import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type ResponsiveCardTableProps = {
  table: ReactNode;
  cards: ReactNode;
  className?: string;
  cardsClassName?: string;
};

export function ResponsiveCardTable({
  table,
  cards,
  className,
  cardsClassName,
}: ResponsiveCardTableProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    const update = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches);
    };

    update(media);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const showTable = isDesktop !== false;
  const showCards = isDesktop === false;

  return (
    <div className={className}>
      {showTable && <div className="w-full">{table}</div>}
      {showCards && (
        <div className={["space-y-3", cardsClassName].filter(Boolean).join(" ")}>
          {cards}
        </div>
      )}
    </div>
  );
}
