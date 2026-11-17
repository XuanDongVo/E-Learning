import type {
  ActivityReviewQuestion,
  ActivitySessionQuestion,
} from "@/types/student/activity-session";

export type ReviewOrdering = NonNullable<ActivitySessionQuestion["ordering"]>;
export type ReviewOrderingAnswer = NonNullable<
  ActivityReviewQuestion["finalAnswer"]["orderingAnswer"]
>;

export function submittedOrder(answer: unknown): string[] {
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) return [];
  const order = (answer as { order?: unknown }).order;
  return Array.isArray(order) && order.every((key) => typeof key === "string")
    ? order
    : [];
}
