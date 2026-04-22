import Image from "next/image";
import Link from "next/link";

export function ShipPanel() {
  return (
    <div
      className="rounded-[10px] border p-4 backdrop-blur-md"
      style={{
        background: "rgba(0,0,0,0.4)",
        borderColor: "rgba(232,168,56,0.2)",
      }}
    >
      {/* Panel title */}
      <div
        className="flex items-center gap-2 pb-3 mb-3"
        style={{ borderBottom: "1px solid rgba(232,168,56,0.15)" }}
      >
        <span className="text-sm">⛵</span>
        <span
          className="text-[10px] uppercase tracking-[2px] text-gold"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          Le navire &amp; l&apos;équipage
        </span>
        <Link
          href="/equipage"
          className="ml-auto text-[8px] text-gold/50 hover:text-gold transition-colors uppercase tracking-[1px]"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          détail →
        </Link>
      </div>

      {/* Ship image */}
      <div className="relative rounded-md overflow-hidden mb-3">
        <Image
          src="/images/ship-crew.jpg"
          alt="Le navire et son équipage"
          width={900}
          height={500}
          className="w-full h-auto block"
          style={{ imageRendering: "pixelated" }}
        />
        {/* gradient overlay at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
        />
      </div>

    </div>
  );
}
