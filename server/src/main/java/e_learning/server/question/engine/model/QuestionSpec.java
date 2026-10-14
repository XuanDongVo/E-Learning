
package e_learning.server.question.engine.model;

import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

/** Immutable canonical definition shared by Question Bank, Activity and Assignment. */
public interface QuestionSpec {

    QuestionType type();

    QuestionCommon common();

    default String content() {
        return common().content();
    }

    default Difficulty difficulty() {
        return common().difficulty();
    }

    default Optional<String> explanation() {
        return common().optionalExplanation();
    }

    default Optional<String> hint() {
        return common().optionalHint();
    }

    default List<String> mediaReferences() {
        return common().mediaReferences();
    }

    record QuestionCommon(
            String content,
            Difficulty difficulty,
            String explanation,
            String hint,
            List<String> mediaReferences
    ) {
        public QuestionCommon {
            content = Objects.requireNonNull(content, "content");
            difficulty = Objects.requireNonNull(difficulty, "difficulty");
            mediaReferences = List.copyOf(
                    mediaReferences == null ? List.of() : mediaReferences
            );
        }

        public Optional<String> optionalExplanation() {
            return Optional.ofNullable(explanation);
        }

        public Optional<String> optionalHint() {
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
