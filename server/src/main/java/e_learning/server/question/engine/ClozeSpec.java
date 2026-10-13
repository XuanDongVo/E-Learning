package e_learning.server.question.engine;

import e_learning.server.question.enums.QuestionType;
import java.util.*;

public record ClozeSpec(QuestionSpec.QuestionCommon common, List<Segment> segments,
                        List<Blank> blanks) implements QuestionSpec {
    public ClozeSpec {
        common = Objects.requireNonNull(common);
        segments = List.copyOf(segments == null ? List.of() : segments);
        blanks = List.copyOf(blanks == null ? List.of() : blanks);
    }
    public QuestionType type() { return QuestionType.CLOZE; }
    public record Segment(String text) { public Segment { text = Objects.requireNonNull(text); } }
    public record Blank(String key, List<String> acceptedAnswers) {
        public Blank { key = Objects.requireNonNull(key).trim(); acceptedAnswers = List.copyOf(acceptedAnswers == null ? List.of() : acceptedAnswers); }
    }
}
