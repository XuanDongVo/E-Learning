package e_learning.server.question.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ClozeDefinitionRequest {
    private Boolean caseSensitive;
    @NotNull
    @Valid
    private List<Segment> segments;

    @NotNull
    @Valid
    private List<Blank> blanks;

    @Data
    public static class Segment {
        private String text;
    }

    @Data
    public static class Blank {
        @NotBlank
        private String key;

        private List<String> acceptedAnswers;
    }
}