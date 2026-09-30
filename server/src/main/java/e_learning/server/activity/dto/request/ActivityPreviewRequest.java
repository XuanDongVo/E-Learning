package e_learning.server.activity.dto.request;

import jakarta.validation.Valid;

import java.util.List;

public record ActivityPreviewRequest(

        Long activityId,

        Long topicId,

        String name,

        String description,

        String distributionMode,

        Integer totalQuestions,

        String selectionStrategy,

        String mode,

        Integer timeLimitSeconds,

        Integer lives,

        Long gameTemplateId,

        List<@Valid ActivityBankRequest> banks
) {
}