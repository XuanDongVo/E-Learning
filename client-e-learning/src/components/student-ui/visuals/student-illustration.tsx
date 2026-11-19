import Image from "next/image";
import { cn } from "@/lib/utils";
import { studentVisualRegistry, type StudentVisualId } from "@/lib/student-visuals/registry";

type IllustrationBase = {
  id: StudentVisualId;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

/** Accessible image contract: information requires localized alt; pure decoration has no alt. */
export type StudentIllustrationProps = IllustrationBase & (
  | { decorative: true; alt?: never }
  | { decorative?: false; alt: string }
);

export function StudentIllustration({
  id, decorative = false, alt, priority = false, className, sizes, width, height,
}: StudentIllustrationProps) {
  const asset = studentVisualRegistry[id];
  return (
    <Image
      src={asset.src}
      alt={decorative ? "" : (alt ?? "")}
      aria-hidden={decorative || undefined}
      priority={priority}
      width={width ?? asset.width}
      height={height ?? asset.height}
      sizes={sizes}
      className={cn("h-auto max-w-full object-contain", className)}
    />
  );
}
