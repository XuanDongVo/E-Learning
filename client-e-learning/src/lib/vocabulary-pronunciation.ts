import type { PronunciationAccent } from "@/types/vocabulary-game";

/** Browser speech synthesis: no recorded audio or external TTS assets. */
export function speakVocabulary(word: string, accent: PronunciationAccent = "US") {
  if (!word.trim() || typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  try {
    const synth = window.speechSynthesis;
    const lang = accent === "UK" ? "en-GB" : "en-US";
    const voice = synth.getVoices().find((item) => item.lang.toLowerCase().replace("_", "-") === lang.toLowerCase());
    const utterance = new SpeechSynthesisUtterance(word.trim());
    utterance.lang = lang;
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    synth.cancel();
    synth.speak(utterance);
    return Boolean(voice);
  } catch {
    return false;
  }
}
