import { studentAssignmentAttemptService } from "@/services/student/student-assignment-attempt.service";

/**
 * When client auto-submit fails (network) but the server timeout job already
 * finalized the attempt, recover by polling GET result instead of leaving the
 * student stuck on the error banner.
 */
export async function pollFinalizedResult(assignmentId: number): Promise<boolean> {
  const delaysMs = [400, 900, 1600, 2500];
  for (const delay of delaysMs) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const response = await studentAssignmentAttemptService.result(assignmentId);
      const status = response.data?.status;
      if (status === "SUBMITTED" || status === "TIMED_OUT") {
        return true;
      }
    } catch {
      // keep polling
    }
  }
  return false;
}
