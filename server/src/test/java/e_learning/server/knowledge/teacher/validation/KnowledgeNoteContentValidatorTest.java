package e_learning.server.knowledge.teacher.validation;

import com.fasterxml.jackson.databind.ObjectMapper;
import e_learning.server.common.exception.AppException;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class KnowledgeNoteContentValidatorTest {
    private final KnowledgeNoteContentValidator validator =
            new KnowledgeNoteContentValidator(new ObjectMapper());
    private static Map<String,Object> textDoc(String value) {
        return Map.of("type","doc","content",List.of(Map.of(
                "type","paragraph","content",List.of(Map.of("type","text","text",value)))));
    }
    @Test void acceptsV2TextAndEmptySummary() {
        assertDoesNotThrow(() -> validator.validate(textDoc("Present Simple")));
    }
    @Test void rejectsUnknownHtmlLikeNode() {
        var invalid = Map.of("type","doc","content",List.of(Map.of("type","iframe")));
        assertThrows(AppException.class, () -> validator.validate(invalid));
    }
    @Test void rejectsUnsafeLink() {
        var document = Map.of("type","doc","content",List.of(Map.of("type","paragraph",
                "content",List.of(Map.of("type","text","text","Click",
                "marks",List.of(Map.of("type","link","attrs",Map.of("href","javascript:alert(1)"))))))));
        assertThrows(AppException.class, () -> validator.validate(document));
    }
    @Test void acceptsValidTable() {
        Map<String,Object> cell = Map.of("type","tableCell","attrs",Map.of("colspan",1,"rowspan",1),
                "content",List.of(Map.of("type","paragraph")));
        Map<String,Object> row = Map.of("type","tableRow","content",List.of(cell,cell));
        var document = Map.of("type","doc","content",List.of(
                Map.of("type","table","attrs",Map.of("purpose","general"),
                        "content",List.of(row,row))));
        assertDoesNotThrow(() -> validator.validate(document));
    }
}
