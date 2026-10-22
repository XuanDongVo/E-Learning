package e_learning.server.question.dto.request;

import jakarta.validation.Valid;
import lombok.Data;

/** Canonical type-specific authoring payload for compound question definitions. */
@Data
public class QuestionDefinitionRequest {
    @Valid
    private MatchingDefinitionRequest matching;

    @Valid
    private ClozeDefinitionRequest cloze;
}
