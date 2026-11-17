import type { ReviewOrdering } from "./ordering-review-types";
import { submittedOrder } from "./ordering-review-types";
import { OrderingReviewSequence } from "./OrderingReviewSequence";

export function OrderingAttemptAnswer({
  answer,
  ordering,
  fallback,
  label,
}: {
  answer: unknown;
  ordering: ReviewOrdering;
  fallback: string;
  label: string;
}) {
  const byKey = new Map(ordering.items.map((item) => [item.key, item]));
  const items = submittedOrder(answer).flatMap((key) => {
    const item = byKey.get(key);
    return item ? [item] : [];
  });

  return items.length ? (
    <OrderingReviewSequence items={items} label={label} />
  ) : (
    <p className="student-body break-words">{fallback}</p>
  );
}
