package e_learning.server.question.engine.core;

import e_learning.server.question.engine.model.AnswerParseResult;
import e_learning.server.question.engine.model.QuestionSpec;
import e_learning.server.question.engine.model.RawAnswer;
import e_learning.server.question.engine.model.ValidatedAnswer;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.result.GradeResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
public final class QuestionEngine {
    private final QuestionTypeHandlerRegistry registry;

    public QuestionEngine(QuestionTypeHandlerRegistry registry) {
        this.registry = registry;
    }

    public QuestionEngine() {
        this(new QuestionTypeHandlerRegistry());
    }

    //  Kiểm tra định nghĩa câu hỏi có hợp lệ, còn thiếu hay sẵn sàng sử dụng.
    public DefinitionValidation validateDefinition(QuestionSpec spec) {
        return registry.get(spec.type()).validateDefinition(spec);
    }

    //Kiểm tra và chuyển đầu vào chưa tin cậy thành câu trả lời có cấu trúc hợp lệ.
    public AnswerParseResult parseAndValidate(QuestionSpec spec, RawAnswer raw) {
        return registry.get(spec.type()).parseAndValidate(spec, raw);
    }

    //Chấm câu trả lời đã được xác thực.
    public GradeResult grade(QuestionSpec spec, ValidatedAnswer answer) {
        return registry.get(spec.type()).grade(spec, answer);
    }
}
