package e_learning.server.question.engine.core;

import e_learning.server.question.engine.exception.QuestionEngineException;
import e_learning.server.question.engine.types.choice.MultipleChoiceHandler;
import e_learning.server.question.engine.types.choice.SingleChoiceHandler;
import e_learning.server.question.engine.types.compound.ClozeHandler;
import e_learning.server.question.engine.types.compound.MatchingHandler;
import e_learning.server.question.engine.types.text.FillInBlankHandler;
import e_learning.server.question.engine.types.text.TypeAnswerHandler;
import e_learning.server.question.engine.types.truefalse.TrueFalseHandler;
import e_learning.server.question.enums.QuestionType;

import java.util.*;

public final class QuestionTypeHandlerRegistry {
    private final Map<QuestionType, QuestionTypeHandler> handlers;

    public QuestionTypeHandlerRegistry(Collection<? extends QuestionTypeHandler> handlers) {
        EnumMap<QuestionType, QuestionTypeHandler> map = new EnumMap<>(QuestionType.class);
        for (QuestionTypeHandler handler : handlers) {
            if (map.put(handler.type(), handler) != null)
                throw new QuestionEngineException("Duplicate handler: " + handler.type());
        }
        if (map.size() != QuestionType.values().length)
            throw new QuestionEngineException("Missing question type handler");
        this.handlers = Map.copyOf(map);
    }

    public QuestionTypeHandlerRegistry() {
        this(List.of(new SingleChoiceHandler(), new MultipleChoiceHandler(), new TrueFalseHandler(),
                new FillInBlankHandler(), new TypeAnswerHandler(), new MatchingHandler(), new ClozeHandler()));
    }

    public QuestionTypeHandler get(QuestionType type) {
        return Optional.ofNullable(handlers.get(type))
                .orElseThrow(() -> new QuestionEngineException("Unsupported question type: " + type));
    }
}
