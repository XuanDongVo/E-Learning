export function QuestionPrompt({ prompt }: { prompt?: string | null }) {
  return prompt ? <h1 className="student-section-title">{prompt}</h1> : null;
}
