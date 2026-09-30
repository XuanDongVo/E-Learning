package e_learning.server.activity.dto.response;

import e_learning.server.activity.enums.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private Long id;
    private Long gradeId;
    private String gradeName;
    private Long unitId;
    private String unitCode;
    private String unitName;
    private String name;
    private String description;
    private Integer displayOrder;
    private ActivityStatus status;
    private DistributionMode distributionMode;
    private Integer totalQuestions;
    private SelectionStrategy selectionStrategy;
    private ActivityMode mode;
    private Integer timeLimitSeconds;
    private Integer lives;
    private List<ActivityBankResponse> banks;
    private ActivityReadinessResponse readiness;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;
}
