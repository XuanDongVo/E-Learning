"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import { speakVocabulary } from "@/lib/vocabulary-pronunciation";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";

type SpeechEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type SpeechRecognizer = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechBrowser = Window & {
  SpeechRecognition?: new () => SpeechRecognizer;
  webkitSpeechRecognition?: new () => SpeechRecognizer;
};

export function VocabularyPronunciation({
  card,
  onComplete,
  onReset,
}: {
  card: StudentVocabularyStudyCard;
  onComplete: () => void;
  onReset: () => void;
}) {
  const [accent, setAccent] = useState<"UK" | "US">("US");
  const [heard, setHeard] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const recognizer = useRef<SpeechRecognizer | null>(null);
  useEffect(
    () => () => {
      recognizer.current?.stop();
    },
    [],
  );

  const start = () => {
    const browser = window as SpeechBrowser;
    const Recognition =
      browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setError(
        "Trình duyệt chưa hỗ trợ micro. Bạn có thể nghe mẫu và tự luyện đọc.",
      );
      return;
    }
    try {
      const instance = new Recognition();
      recognizer.current = instance;
      instance.lang = accent === "UK" ? "en-GB" : "en-US";
      instance.interimResults = false;
      instance.onresult = (event) => {
        setHeard(event.results[0]?.[0]?.transcript ?? "");
        onComplete();
      };
      instance.onerror = (event) =>
        setError(
          event.error === "not-allowed"
            ? "Bạn chưa cấp quyền micro."
            : "Không nhận được giọng nói. Bạn có thể thử lại.",
        );
      instance.onend = () => {
        setListening(false);
        recognizer.current = null;
      };
      setError("");
      setHeard(null);
      instance.start();
      setListening(true);
    } catch {
      setListening(false);
      setError("Không thể bật micro. Hãy thử nghe mẫu và tự luyện đọc.");
    }
  };

  return (
    <section className="space-y-4 text-center">
      <h3 className="student-card-title text-foreground">
        Nghe và phát âm: {card.word}
      </h3>
      <div
        className="flex justify-center gap-2"
        role="group"
        aria-label="Chọn giọng đọc"
      >
        {(["UK", "US"] as const).map((voice) => (
          <button
            key={voice}
            type="button"
            aria-pressed={accent === voice}
            onClick={() => {
              recognizer.current?.stop();
              setAccent(voice);
              setHeard(null);
              onReset();
            }}
            className={`student-control px-4 ${accent === voice ? "student-filter-active" : "student-control--quiet"}`}
          >
            {voice === "UK" ? "Anh–Anh (uk)" : "Anh–Mỹ (us)"}
          </button>
        ))}
      </div>
      <p className="student-body text-muted-foreground">
        {accent === "UK" ? card.pronunciationUk : card.pronunciationUs}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="student-control student-control--secondary inline-flex items-center gap-2 px-4"
          onClick={() => {
            speakVocabulary(card.word, accent);
            onComplete();
          }}
        >
          <Volume2 className="size-4" /> Nghe mẫu
        </button>
        <button
          type="button"
          disabled={listening}
          className="student-control student-control--action inline-flex items-center gap-2 px-4"
          onClick={start}
        >
          <Mic className="size-4" /> {listening ? "Đang nghe..." : "Thử nói"}
        </button>
      </div>
      <button
        type="button"
        className="student-control student-control--quiet px-4"
        onClick={onComplete}
      >
        Tôi đã tự luyện đọc
      </button>
      {heard !== null && (
        <p role="status" className="student-body text-foreground">
          Trình duyệt nghe được: “{heard}”.
        </p>
      )}
      {error && (
        <p role="alert" className="student-body text-destructive">
          {error}
        </p>
      )}
      <p className="student-caption text-muted-foreground">
        Nhận dạng văn bản không phải chấm độ chính xác phát âm. Bạn có thể tự
        đánh giá để tiếp tục.
      </p>
    </section>
  );
}
