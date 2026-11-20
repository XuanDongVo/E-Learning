package e_learning.server.knowledge.student.dto;

import java.time.LocalDateTime;
import java.util.List;

public record StudentKnowledgeNoteSummary(
        Long id, String title, String description, LocalDateTime updatedAt,
        List<StudentKnowledgeUnitTag> units
) {}
