package e_learning.server.question.engine;

import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Immutable canonical definition of a question.
 */
public sealed interface QuestionSpec permits SingleChoiceSpec, MultipleChoiceSpec, TrueFalseSpec,
        FillInBlankSpec, TypeAnswerSpec, MatchingSpec, ClozeSpec {
    QuestionType type();

    QuestionCommon common();

    default String content() {
        return common().content();
    }

    default Difficulty difficulty() {
        return common().difficulty();
    }

    default Optional<String> explanation() {
        return common().explanation();
    }

    default Optional<String> hint() {
        return common().hint();
    }

    default List<String> mediaReferences() {
        return common().mediaReferences();
    }

    record QuestionCommon(String content, Difficulty difficulty, String explanation, String hint,
                          List<String> mediaReferences) {
        public QuestionCommon {
            content = Objects.requireNonNull(content, "content");
            difficulty = Objects.requireNonNull(difficulty, "difficulty");
            mediaReferences = List.copyOf(mediaReferences == null ? List.of() : mediaReferences);
        }

        public Optional<String> explanation() {
            return Optional.ofNullable(explanation);
        }

        public Optional<String> hint() {
            return Optional.ofNullable(hint);
        }
    }

    record Choice(String key, String content) {
        public Choice {
            key = Objects.requireNonNull(key, "key").trim();
            content = Objects.requireNonNull(content, "content");
        }
    }
}
