package e_learning.server.question.dto.request;

import jakarta.validation.Valid;
import lombok.Data;
import e_learning.server.question.dto.request.ordering.OrderingDefinitionRequest;

/** Canonical type-specific authoring payload for compound question definitions. */
@Data
public class QuestionDefinitionRequest {
    @Valid
    private MatchingDefinitionRequest matching;

    @Valid
    private ClozeDefinitionRequest cloze;

    @Valid
    private OrderingDefinitionRequest ordering;

    private TextInput textInput;

    @Data
    public static class TextInput {
        private String prefix;
        private String cue;
    }
}
