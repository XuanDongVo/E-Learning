package e_learning.server.question.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/** Canonical type-specific authoring payload for compound question definitions. */
@Data
public class QuestionDefinitionRequest {
    private Matching matching;
    private Cloze cloze;
    private TextInput textInput;

    @Data
    public static class TextInput {
        private String prefix;
        private String cue;
    }

    @Data
    public static class Matching {
        private List<Item> items;
        private List<String> answerPool;
        private Map<String, String> expectedPairs;
        private Boolean shuffleAnswers;

        @Data
        public static class Item {
            private String key;
            private String prompt;
        }
    }

    @Data
    public static class Cloze {
        private Boolean caseSensitive;
        private List<Segment> segments;
        private List<Blank> blanks;

        @Data
        public static class Segment { private String text; }

        @Data
        public static class Blank {
            private String key;
            private List<String> acceptedAnswers;
        }
    }
}
