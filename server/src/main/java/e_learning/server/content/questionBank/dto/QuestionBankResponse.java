package e_learning.server.content.questionBank.dto;

import e_learning.server.content.common.enums.ContentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionBankResponse {
    private Long id;
    private Long topicId;
    private String topicName;
    private String name;
    private String description;
    private Integer displayOrder;
    private ContentStatus status;
    private long totalQuestions;
    private long readyQuestions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
