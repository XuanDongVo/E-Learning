export function OrderingReviewSequence({
  items,
  label,
}: {
  items: { key: string; content: string }[];
  label: string;
}) {
  return (
    <ol aria-label={label} className="mt-1 grid gap-2">
      {items.map((item, index) => (
        <li
          key={`${item.key}:${index}`}
          className="student-body flex min-w-0 items-start gap-2 break-words"
        >
          <span className="student-meta grid size-7 shrink-0 place-items-center rounded-full border border-border bg-background">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1 break-words">{item.content}</span>
        </li>
      ))}
    </ol>
  );
}
