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
    <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${colorToneClasses[tone]}`}>
      {children}
    </div>
  );
}
