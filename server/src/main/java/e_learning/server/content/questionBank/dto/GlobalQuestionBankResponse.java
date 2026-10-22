package e_learning.server.content.questionBank.dto;

import e_learning.server.content.common.enums.ContentStatus;
import java.time.LocalDateTime;

public record GlobalQuestionBankResponse(
        Long id,
        String name,
        String description,
        ContentStatus status,
        Integer displayOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long topicId,
        String topicName,
        Long sectionId,
        String sectionName,
        Long unitId,
        String unitCode,
        String unitName,
        Long gradeId,
        String gradeName,
        long totalQuestions,
        long readyQuestions
) {}
