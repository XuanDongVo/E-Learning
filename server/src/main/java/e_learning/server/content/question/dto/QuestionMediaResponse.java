package e_learning.server.content.question.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionMediaResponse {
    private Long id;
    private Long mediaId;
    private String mediaType;
    private String url;
}
