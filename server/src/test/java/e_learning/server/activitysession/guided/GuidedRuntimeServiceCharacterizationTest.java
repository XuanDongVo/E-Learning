package e_learning.server.activitysession.guided;

import e_learning.server.activitysession.entity.ActivitySessionGuidedStepAttempt;
import e_learning.server.activitysession.entity.ActivitySessionQuestion;
import e_learning.server.activitysession.enums.GuidedQuestionStage;
import e_learning.server.activitysession.enums.QuestionDeliveryType;
import e_learning.server.activitysession.repository.ActivitySessionGuidedStepAttemptRepository;
import e_learning.server.activitysession.repository.ActivitySessionGuidedStepHintRepository;
import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.guided.GuidedDefinitionRepository;
import e_learning.server.question.guided.GuidedDefinitionValidationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.ObjectMapper;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GuidedRuntimeServiceCharacterizationTest {
    @Mock private GuidedDefinitionRepository definitionRepository;
    @Mock private GuidedDefinitionValidationService definitionValidationService;
    @Mock private ActivitySessionGuidedStepAttemptRepository attemptRepository;
    @Mock private ActivitySessionGuidedStepHintRepository hintRepository;
    @Mock private QuestionEngine questionEngine;
    @Mock private ObjectMapper objectMapper;
    @InjectMocks private GuidedRuntimeService service;

    @Test
    void deliveryTypeIsTheOnlyGuidedDiscriminator() {
        ActivitySessionQuestion classic = new ActivitySessionQuestion();
        classic.setDeliveryType(QuestionDeliveryType.CLASSIC);
        classic.setGuidedSnapshotPayload("{}");
        ActivitySessionQuestion guided = new ActivitySessionQuestion();
        guided.setDeliveryType(QuestionDeliveryType.GUIDED_REASONING);

        assertFalse(service.isGuided(classic));
        assertTrue(service.isGuided(guided));
    }

    @Test
    void replayReturnsStoredOutcomeBeforeInspectingCurrentStepOrStage() {
        ActivitySessionQuestion item = new ActivitySessionQuestion();
        item.setId(40L);
        item.setDeliveryType(QuestionDeliveryType.GUIDED_REASONING);
        UUID requestId = UUID.randomUUID();
        ActivitySessionGuidedStepAttempt stored = new ActivitySessionGuidedStepAttempt(
                item, "step-1", 1, requestId, "\"A\"", true,
                false, true, GuidedQuestionStage.STEP_ACTIVE);
        when(attemptRepository.findBySessionQuestionIdAndRequestId(40L, requestId))
                .thenReturn(Optional.of(stored));

        var result = service.answer(
                item, "step-1", requestId.toString(),
                mockJson("\"A\""));

        assertTrue(result.correct());
        assertTrue(result.stepResolved());
        assertEquals(GuidedQuestionStage.STEP_ACTIVE, result.stage());
        verifyNoInteractions(definitionValidationService, questionEngine, objectMapper);
    }

    private tools.jackson.databind.JsonNode mockJson(String serialized) {
        tools.jackson.databind.JsonNode value = mock(tools.jackson.databind.JsonNode.class);
        when(value.toString()).thenReturn(serialized);
        return value;
    }
}
