package e_learning.server.content.knowledge.repository;
import e_learning.server.content.knowledge.entity.KnowledgeNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface KnowledgeNoteRepository extends JpaRepository<KnowledgeNote, Long>, JpaSpecificationExecutor<KnowledgeNote> {}
