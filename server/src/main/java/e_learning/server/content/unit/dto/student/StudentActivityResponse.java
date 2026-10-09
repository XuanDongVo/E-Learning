package e_learning.server.content.unit.dto.student;

import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.enums.ActivityMode;

import java.util.List;

public record StudentActivityResponse(
        Long id,
        String name,
        String description,
        ActivityMode mode,
        Integer totalQuestions,
        Integer timeLimitSeconds,
        Integer lives,
        List<Long> topicIds
) {
    public StudentActivityResponse {
        topicIds = topicIds == null ? List.of() : List.copyOf(topicIds);
    }

    public StudentActivityResponse toActivity(
            Activity activity,
            List<Long> topicIds
    ) {
        return new StudentActivityResponse(
                activity.getId(),
                activity.getName(),
                activity.getDescription(),
                activity.getMode(),
                activity.getTotalQuestions(),
                activity.getTimeLimitSeconds(),
                activity.getLives(),
                topicIds
        );
    }
}