package e_learning.server.question.engine;

import java.util.*;
import java.util.stream.Collectors;

abstract class TextAnswerHandler extends AbstractQuestionTypeHandler {
    protected abstract List<String> accepted(QuestionSpec spec);
    protected abstract MatchingMode mode(QuestionSpec spec);
    public DefinitionValidation validateDefinition(QuestionSpec s){DefinitionValidation c=common(s);if(c!=null)return c;if(accepted(s).stream().noneMatch(x->x!=null&&!x.isBlank()))return DefinitionValidation.incomplete("answers.required");return DefinitionValidation.ready();}
    public AnswerParseResult parseAndValidate(QuestionSpec s,RawAnswer raw){requireType(s);String v=text(raw==null?null:raw.value());if(v.isBlank())return AnswerParseResult.invalid("answer.required");return AnswerParseResult.valid(new ValidatedAnswer(type(),v));}
    public GradeResult grade(QuestionSpec s,ValidatedAnswer a){String actual=normalize(text(a.value()),mode(s));Set<String> expected=accepted(s).stream().filter(Objects::nonNull).map(x->normalize(x,mode(s))).collect(Collectors.toSet());return gradeOne("answer",true,expected.contains(actual),actual);}
}
