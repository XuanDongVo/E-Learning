package e_learning.server.activity.dto.response;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityPreviewResponse {

    private ActivityReadinessResponse readiness;

    private List<Long> sampleQuestionIds;

    private Integer totalSampleQuestions;
}