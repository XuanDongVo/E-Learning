package e_learning.server.question.guided;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.question.entity.ContentQuestion;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.guided.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GuidedDefinitionService {
    private static final int SCHEMA_VERSION = 1;
    private final ContentQuestionRepository contentQuestionRepository;
    private final GuidedDefinitionRepository guidedDefinitionRepository;
    private final GuidedDefinitionValidationService validationService;
    private final ObjectMapper objectMapper;

    public GuidedDefinitionResponse get(Long questionId) {
        ContentQuestion contentQuestion = findContentQuestion(questionId);
        GuidedDefinition definition = guidedDefinitionRepository.findByQuestionId(contentQuestion.getQuestionId())
                .orElseThrow(() -> new AppException(ErrorCode.GUIDED_DEFINITION_NOT_FOUND));
        return toResponse(definition);
    }

    @Transactional
    public GuidedDefinitionResponse saveDraft(Long questionId, GuidedDefinitionUpsertRequest request) {
        ContentQuestion contentQuestion = findContentQuestion(questionId);
        GuidedDefinitionPayload payload = toPayload(request);
        List<GuidedDefinitionIssue> draftIssues = validationService.validateDraftShape(payload);
        if (!draftIssues.isEmpty()) {
            throw new AppException(ErrorCode.GUIDED_DEFINITION_INVALID, "Invalid draft structure: " + draftIssues.getFirst().path());
        }

        GuidedDefinition definition = guidedDefinitionRepository.findByQuestionId(contentQuestion.getQuestionId())
                .orElseGet(() -> newDefinition(contentQuestion));
        assertExpectedVersion(definition, request.expectedVersion());
        definition.setSchemaVersion(SCHEMA_VERSION);
        definition.setStatus(GuidedDefinitionStatus.DRAFT);
        definition.setSourceQuestionRevision(null);
        definition.setDefinitionPayload(toMap(payload));
        return toResponse(guidedDefinitionRepository.saveAndFlush(definition));
    }

    @Transactional
    public GuidedDefinitionValidationResponse validateAndMarkReady(Long questionId,
                                                                   GuidedDefinitionValidateRequest request) {
        ContentQuestion contentQuestion = findContentQuestion(questionId);
        GuidedDefinition definition = guidedDefinitionRepository.findByQuestionId(contentQuestion.getQuestionId())
                .orElseThrow(() -> new AppException(ErrorCode.GUIDED_DEFINITION_NOT_FOUND));
        assertExpectedVersion(definition, request.expectedVersion());

        List<GuidedDefinitionIssue> issues = validationService.validateReady(
                contentQuestion.getQuestion(), payloadFrom(definition));
        if (!issues.isEmpty()) {
            return new GuidedDefinitionValidationResponse(false, issues, toResponse(definition));
        }

        definition.setStatus(GuidedDefinitionStatus.READY);
        definition.setSourceQuestionRevision(contentQuestion.getQuestion().getContentRevision());
        GuidedDefinition saved = guidedDefinitionRepository.saveAndFlush(definition);
        return new GuidedDefinitionValidationResponse(true, List.of(), toResponse(saved));
    }

    @Transactional
    public void delete(Long questionId) {
        ContentQuestion contentQuestion = findContentQuestion(questionId);
        GuidedDefinition definition = guidedDefinitionRepository.findByQuestionId(contentQuestion.getQuestionId())
                .orElseThrow(() -> new AppException(ErrorCode.GUIDED_DEFINITION_NOT_FOUND));
        guidedDefinitionRepository.delete(definition);
    }

    public GuidedCapabilitiesResponse capabilities() {
        return new GuidedCapabilitiesResponse(
                List.of(QuestionType.SINGLE_CHOICE,
                        QuestionType.TRUE_FALSE,
                        QuestionType.TYPE_ANSWER),
                false, false, 2);
    }

    private ContentQuestion findContentQuestion(Long questionId) {
        return contentQuestionRepository.findById(questionId)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
    }

    private GuidedDefinition newDefinition(ContentQuestion contentQuestion) {
        GuidedDefinition definition = new GuidedDefinition();
        definition.setQuestion(contentQuestion.getQuestion());
        definition.setSchemaVersion(SCHEMA_VERSION);
        definition.setStatus(GuidedDefinitionStatus.DRAFT);
        return definition;
    }

    private void assertExpectedVersion(GuidedDefinition definition, Long expectedVersion) {
        long actualVersion = definition.getId() == null ? 0L : definition.getVersion();
        if (expectedVersion == null || expectedVersion != actualVersion) {
            throw new AppException(ErrorCode.GUIDED_DEFINITION_VERSION_CONFLICT);
        }
    }

    private GuidedDefinitionPayload toPayload(GuidedDefinitionUpsertRequest request) {
        List<GuidedStepPayload> steps = new ArrayList<>();
        List<GuidedStepRequest> requestedSteps = request.steps() == null ? List.of() : request.steps();
        for (GuidedStepRequest step : requestedSteps) {
            if (step == null) {
                throw new AppException(ErrorCode.GUIDED_DEFINITION_INVALID, "A guided step cannot be null");
            }
            List<GuidedChoicePayload> choices = (step.options() == null ? List.<GuidedChoiceRequest>of() : step.options())
                    .stream()
                    .map(choice -> choice == null
                            ? new GuidedChoicePayload(null, null)
                            : new GuidedChoicePayload(trimToNull(choice.key()), trimToNull(choice.content())))
                    .toList();
            List<String> acceptedAnswers = (step.acceptedAnswers() == null ? List.<String>of() : step.acceptedAnswers())
                    .stream().map(this::trimToNull).toList();
            steps.add(new GuidedStepPayload(
                    trimToNull(step.stepKey()), step.position(), step.type(), trimToNull(step.prompt()), choices,
                    trimToNull(step.correctKey()), step.expected(), acceptedAnswers,
                    step.matchingMode() == null ? MatchingMode.CASE_INSENSITIVE_TRIM : step.matchingMode(),
                    trimToNull(step.explanation()), Boolean.TRUE.equals(step.hintEnabled()), trimToNull(step.hint()),
                    Boolean.TRUE.equals(step.retryEnabled())));
        }
        return new GuidedDefinitionPayload(trimToNull(request.introContent()), steps);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> toMap(GuidedDefinitionPayload payload) {
        return objectMapper.convertValue(payload, Map.class);
    }

    private GuidedDefinitionPayload payloadFrom(GuidedDefinition definition) {
        try {
            GuidedDefinitionPayload payload = objectMapper.convertValue(
                    definition.getDefinitionPayload(), GuidedDefinitionPayload.class);
            if (payload == null) throw new IllegalArgumentException("Missing payload");
            return payload;
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.GUIDED_DEFINITION_INVALID, "Stored guided definition is invalid");
        }
    }

    private GuidedDefinitionResponse toResponse(GuidedDefinition definition) {
        GuidedDefinitionPayload payload = payloadFrom(definition);
        List<GuidedStepResponse> steps = payload.steps().stream().map(step -> new GuidedStepResponse(
                step.stepKey(), step.position(), step.type(), step.prompt(),
                step.options().stream().map(choice -> new GuidedChoiceRequest(choice.key(), choice.content())).toList(),
                step.correctKey(), step.expected(), step.acceptedAnswers(), step.matchingMode(), step.explanation(),
                step.hintEnabled(), step.hint(), step.retryEnabled())).toList();
        return new GuidedDefinitionResponse(definition.getQuestion().getId(), definition.getSchemaVersion(),
                definition.getVersion(), definition.getStatus(), definition.getSourceQuestionRevision(),
                payload.introContent(), steps);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
