package e_learning.server.content.knowledge.repository;
import e_learning.server.content.knowledge.entity.KnowledgeNoteRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface KnowledgeNoteRevisionRepository extends JpaRepository<KnowledgeNoteRevision, Long> {
    List<KnowledgeNoteRevision> findByNoteIdOrderByRevisionNumberDesc(Long noteId);
}
