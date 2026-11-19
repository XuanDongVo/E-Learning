/** S02 — mount below the selected Topic filter and above Activity cards in Phase 04.
 * Only the published Primary Note supplies a Quick Summary.
 * Supplementary-only Topics display reading links without forced Primary.
 */
export function StudentTopicKnowledge({ topicId }: { topicId: number }) {
  void topicId;
  // Fail closed: do not display a misleading empty Summary until the read API is enabled.
  return null;
}
