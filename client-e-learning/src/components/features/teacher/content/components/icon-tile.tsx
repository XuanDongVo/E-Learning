import type { ContentTone } from "@/types/content";

interface IconTileProps {
  tone?: ContentTone;
  children: React.ReactNode;
}

const toneClasses: Record<ContentTone, string> = {
  mint: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-orange-50 text-orange-500",
  teal: "bg-cyan-50 text-cyan-600",
  pink: "bg-pink-50 text-pink-500",
};

export function IconTile({
  tone = "blue",
  children,
}: IconTileProps) {
  return (
    <div className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] ${toneClasses[tone]}`}>
      {children}
    </div>
  );
}