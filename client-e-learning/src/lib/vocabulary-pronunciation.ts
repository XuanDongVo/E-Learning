// import type { PronunciationAccent } from "@/types/vocabulary-game";

// /** Browser speech synthesis: no recorded audio or external TTS assets. */
// export function speakVocabulary(word: string, accent: PronunciationAccent = "US") {
//   if (!word.trim() || typeof window === "undefined" || !("speechSynthesis" in window)) return false;

//   try {
//     const synth = window.speechSynthesis;
//     const lang = accent === "UK" ? "en-GB" : "en-US";
//     const voice = synth.getVoices().find((item) => item.lang.toLowerCase().replace("_", "-") === lang.toLowerCase());
//     const utterance = new SpeechSynthesisUtterance(word.trim());
//     utterance.lang = lang;
//     if (voice) utterance.voice = voice;
//     utterance.rate = 0.9;
//     synth.cancel();
//     synth.speak(utterance);
//     return Boolean(voice);
//   } catch {
//     return false;
//   }
// }

/**
 * Tiện ích đọc phát âm từ vựng qua Web Speech API
 */
export function speakVocabulary(text: string, voiceType: "US" | "UK" = "US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9; 
  utterance.lang = voiceType === "UK" ? "en-GB" : "en-US";

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) =>
    voiceType === "UK"
      ? v.lang.includes("en-GB") || v.name.includes("UK") || v.name.includes("British")
      : v.lang.includes("en-US") || v.name.includes("US") || v.name.includes("American")
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

