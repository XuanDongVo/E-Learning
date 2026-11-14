package e_learning.server.content.question.service;

import e_learning.server.content.question.dto.*;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import e_learning.server.question.dto.response.QuestionContentResponse;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.entity.Question;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.guided.GuidedDefinitionService;
import e_learning.server.question.guided.dto.GuidedDefinitionUpsertRequest;
import e_learning.server.question.service.QuestionPersistenceService;
import e_learning.server.question.service.QuestionResponseMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuestionServiceBulkGuidedTest {
    @Mock private ContentQuestionRepository contentQuestionRepository;
    @Mock private QuestionBankRepository questionBankRepository;
    @Mock private QuestionPersistenceService questionPersistenceService;
    @Mock private GuidedDefinitionService guidedDefinitionService;
    @Mock private QuestionResponseMapper questionResponseMapper;
    @InjectMocks private QuestionService service;

    @Test
    void savesOptionalGuidedDraftForTheCreatedQuestion() {
        CreateQuestionRequest questionRequest = questionRequest();
        GuidedDefinitionUpsertRequest guided = new GuidedDefinitionUpsertRequest(0L, null, List.of());
        BulkCreateQuestionsWithGuidedRequest request = new BulkCreateQuestionsWithGuidedRequest(List.of(
                new BulkQuestionWithGuidedRequest("draft-1", questionRequest, guided)));
        Question question = Question.builder().id(44L).type(QuestionType.TRUE_FALSE)
                .difficulty(Difficulty.EASY).content("Prompt").complete(true).build();

        when(questionBankRepository.findById(3L)).thenReturn(Optional.of(mock()));
        when(questionPersistenceService.createQuestions(any())).thenReturn(List.of(question));
        when(questionResponseMapper.toContentResponse(question)).thenReturn(QuestionContentResponse.builder()
                .id(44L).type(QuestionType.TRUE_FALSE).difficulty(Difficulty.EASY).content("Prompt")
                .options(List.of()).answers(List.of()).media(List.of()).build());

        var result = service.createQuestionsWithGuided(request);

        assertThat(result).singleElement().satisfies(item -> {
            assertThat(item.draftId()).isEqualTo("draft-1");
            assertThat(item.question().getId()).isEqualTo(44L);
        });
        verify(guidedDefinitionService).createDraftForNewQuestion(question, guided);
    }

    private CreateQuestionRequest questionRequest() {
        CreateQuestionRequest request = new CreateQuestionRequest();
        request.setQuestionBankId(3L);
        request.setType(QuestionType.TRUE_FALSE);
        request.setDifficulty(Difficulty.EASY);
        request.setContent("Prompt");
        var answer = new e_learning.server.question.dto.request.QuestionAnswerRequest();
        answer.setRawValue("TRUE");
        request.setAnswers(List.of(answer));
        request.setMatchingMode(MatchingMode.CASE_INSENSITIVE_TRIM);
        return request;
    }
}
