import type { ActivitySessionQuestion } from "@/types/activity-session";

export type RuntimeOrdering = NonNullable<ActivitySessionQuestion["ordering"]>;
export type RuntimeOrderingItem = RuntimeOrdering["items"][number];
