import type { ContentTone } from "@/types/content";
import { colorToneClasses } from "@/utils/theme";
interface IconTileProps {
  tone?: ContentTone;
  children: React.ReactNode;
}

export function IconTile({
  tone = "blue",
  children,
}: IconTileProps) {
  return (
    <div className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] ${colorToneClasses[tone]}`}>
      {children}
    </div>
  );
}