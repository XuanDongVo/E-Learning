import type { ReviewOrderingAnswer } from "./ordering-review-types";
import { OrderingReviewSequence } from "./OrderingReviewSequence";

export function OrderingSuggestedAnswer({
  answer,
  label,
}: {
  answer: ReviewOrderingAnswer;
  label: string;
}) {
  return <OrderingReviewSequence items={answer.items} label={label} />;
}
