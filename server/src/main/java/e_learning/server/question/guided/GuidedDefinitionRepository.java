package e_learning.server.question.guided;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuidedDefinitionRepository extends JpaRepository<GuidedDefinition, Long> {
    Optional<GuidedDefinition> findByQuestionId(Long questionId);
}
