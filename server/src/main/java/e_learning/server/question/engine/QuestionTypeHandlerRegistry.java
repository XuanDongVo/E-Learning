package e_learning.server.question.engine;

import e_learning.server.question.enums.QuestionType;
import java.util.*;

public final class QuestionTypeHandlerRegistry {
    private final Map<QuestionType, QuestionTypeHandler> handlers;
    public QuestionTypeHandlerRegistry(Collection<? extends QuestionTypeHandler> handlers) {
        EnumMap<QuestionType,QuestionTypeHandler> map=new EnumMap<>(QuestionType.class);
        for(QuestionTypeHandler h:handlers) if(map.put(h.type(),h)!=null) throw new IllegalArgumentException("Duplicate handler: "+h.type());
        if(map.size()!=QuestionType.values().length) throw new IllegalArgumentException("Missing question type handler");
        this.handlers=Map.copyOf(map);
    }
    public QuestionTypeHandlerRegistry(){this(List.of(new SingleChoiceHandler(),new MultipleChoiceHandler(),new TrueFalseHandler(),new FillInBlankHandler(),new TypeAnswerHandler(),new MatchingHandler(),new ClozeHandler()));}
    public QuestionTypeHandler get(QuestionType type){return Optional.ofNullable(handlers.get(type)).orElseThrow(()->new IllegalArgumentException("Unsupported question type: "+type));}
}
