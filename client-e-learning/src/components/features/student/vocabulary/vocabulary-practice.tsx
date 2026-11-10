"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Keyboard, ListChecks, Mic, Volume2 } from "lucide-react";
import { PaperSurface } from "@/components/student-ui/paper-surface";
import { speakVocabulary } from "@/lib/vocabulary-pronunciation";
import type { StudentVocabularyStudyCard } from "@/types/student-vocabulary-review";
import type { PronunciationAccent } from "@/types/vocabulary-game";

type PracticeMode = "choice" | "typing" | "speech";
type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type RecognitionError = { error: string };
type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionError) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

const normalize = (text: string) => text.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");

export function VocabularyPractice({
  card,
  unitCards,
}: {
  card: StudentVocabularyStudyCard;
  unitCards: StudentVocabularyStudyCard[];
}) {
  const [mode, setMode] = useState<PracticeMode>("choice");
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [typingResult, setTypingResult] = useState<boolean | null>(null);
  const [accent, setAccent] = useState<PronunciationAccent>("US");
  const [heard, setHeard] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);

  const choices = useMemo(() => {
    const unique = new Set([normalize(card.meaningVi)]);
    const otherMeanings = unitCards
      .filter((item) => item.wordId !== card.wordId)
      .map((item) => item.meaningVi)
      .filter((meaning) => {
        if (unique.has(normalize(meaning))) return false;
        unique.add(normalize(meaning));
        return true;
      }).slice(0, 3);
    return [card.meaningVi, ...otherMeanings].sort((a, b) => a.localeCompare(b, "vi"));
  }, [card, unitCards]);

  useEffect(() => () => recognition.current?.stop(), []);

  const setPracticeMode = (next: PracticeMode) => {
    recognition.current?.stop();
    setListening(false);
    setMode(next);
    setSelected(null);
    setTyped("");
    setTypingResult(null);
    setHeard(null);
    setSpeechError(null);
  };

  const startListening = () => {
    const speechWindow = window as SpeechWindow;
    const BrowserRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!BrowserRecognition) {
      setSpeechError("Trình duyệt này chưa hỗ trợ nhận dạng giọng nói. Bạn vẫn có thể nghe và tự luyện phát âm.");
      return;
    }
    try {
      const instance = new BrowserRecognition();
      recognition.current = instance;
      instance.lang = accent === "UK" ? "en-GB" : "en-US";
      instance.interimResults = false;
      instance.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        setHeard(transcript);
      };
      instance.onerror = (event) => {
        setSpeechError(event.error === "not-allowed"
          ? "Bạn chưa cấp quyền micro. Có thể tiếp tục bằng trắc nghiệm hoặc gõ từ."
          : "Không nhận được giọng nói. Bạn có thể thử lại hoặc chuyển bài luyện.");
      };
      instance.onend = () => { setListening(false); recognition.current = null; };
      setHeard(null);
      setSpeechError(null);
      instance.start();
      setListening(true);
    } catch {
      setListening(false);
      setSpeechError("Không thể bật micro. Hãy kiểm tra quyền truy cập của trình duyệt.");
    }
  };

  return (
    <PaperSurface as="section" variant="lined" className="space-y-4 p-4 sm:p-6">
      <div>
        <p className="student-meta text-primary">LUYỆN THÊM · KHÔNG TÍNH ĐIỂM</p>
        <h3 className="student-card-title mt-1 text-foreground">Ôn lại bằng cách bạn thích</h3>
        <p className="student-body text-muted-foreground">Phần luyện này không tự thay đổi lịch FSRS. Bạn tự đánh giá trí nhớ sau khi luyện.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn kiểu luyện tập">
        {([
          { key: "choice", label: "Trắc nghiệm", icon: ListChecks },
          { key: "typing", label: "Gõ từ", icon: Keyboard },
          { key: "speech", label: "Phát âm", icon: Mic },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" aria-pressed={mode === key}
            onClick={() => setPracticeMode(key)}
            className={`student-control inline-flex items-center gap-2 px-3 ${mode === key ? "student-filter-active" : "student-control--quiet"}`}>
            <Icon className="size-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {mode === "choice" && (
        <div className="space-y-3">
          <p className="student-label text-foreground">“{card.word}” có nghĩa là gì?</p>
          {choices.length < 2 ? (
            <p className="student-body text-muted-foreground">Unit cần có ít nhất hai từ với nghĩa khác nhau để tạo lựa chọn. Hãy thử Gõ từ.</p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {choices.map((choice) => (
                <button key={choice} type="button" disabled={selected !== null}
                  aria-pressed={selected === choice} onClick={() => setSelected(choice)}
                  className="student-vocab-option">{choice}</button>
              ))}
            </div>
          )}
          {selected !== null && (
            <div role="status" className="student-body text-foreground">
              {selected === card.meaningVi ? "✓ Chính xác!" : `Chưa đúng. Nghĩa đúng: ${card.meaningVi}`}
              <button type="button" className="student-label ml-3 text-primary underline" onClick={() => setSelected(null)}>Thử lại</button>
            </div>
          )}
        </div>
      )}

      {mode === "typing" && (
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); if (typed.trim()) setTypingResult(normalize(typed) === normalize(card.word)); }}>
          <label htmlFor="vocab-typing-answer" className="student-label block text-foreground">Gõ từ tiếng Anh có nghĩa: “{card.meaningVi}”</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input id="vocab-typing-answer" autoComplete="off" spellCheck={false}
              className="student-field min-w-0 flex-1" value={typed} onChange={(event) => { setTyped(event.target.value); setTypingResult(null); }}
              placeholder="Nhập từ tiếng Anh..." />
            <button type="submit" disabled={!typed.trim()} className="student-control student-control--action px-5">Kiểm tra</button>
          </div>
          {typingResult !== null && (
            <p role="status" className="student-body text-foreground">
              {typingResult ? "✓ Bạn đã gõ đúng từ!" : `Chưa đúng. Đáp án: ${card.word}`}
            </p>
          )}
        </form>
      )}

      {mode === "speech" && (
        <div className="space-y-3">
          <p className="student-label text-foreground">Nghe mẫu và đọc to: <strong>{card.word}</strong></p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Chọn giọng luyện phát âm">
            {(["UK", "US"] as const).map((choice) => (
              <button key={choice} type="button" aria-pressed={accent === choice} onClick={() => setAccent(choice)}
                className={`student-control px-4 ${accent === choice ? "student-filter-active" : "student-control--quiet"}`}>
                {choice === "UK" ? "Anh–Anh" : "Anh–Mỹ"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="student-control student-control--secondary inline-flex items-center gap-2 px-4"
              onClick={() => speakVocabulary(card.word, accent)}><Volume2 className="size-4" aria-hidden="true" /> Nghe mẫu {accent}</button>
            <button type="button" disabled={listening}
              className="student-control student-control--action inline-flex items-center gap-2 px-4"
              onClick={startListening}><Mic className="size-4" aria-hidden="true" />{listening ? "Đang nghe..." : "Thử nói"}</button>
          </div>
          {heard !== null && (
            <p role="status" className="student-body text-foreground">
              <CheckCircle2 className="mr-1 inline size-4 text-success" aria-hidden="true" />
              Trình duyệt nghe được: “{heard}”. {normalize(heard) === normalize(card.word) ? "Nhận dạng khớp từ." : `Từ mục tiêu là “${card.word}”.`}
            </p>
          )}
          {speechError && <p role="alert" className="student-body text-destructive">{speechError}</p>}
          <p className="student-caption text-muted-foreground">Nhận dạng do trình duyệt cung cấp, có thể cần Internet/quyền micro. So khớp văn bản không phải chấm độ chính xác phát âm.</p>
        </div>
      )}
    </PaperSurface>
  );
}
