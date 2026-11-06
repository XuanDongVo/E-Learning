package e_learning.server.activitysession.snapshot;

import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
import e_learning.server.question.engine.exception.QuestionEngineException;
import e_learning.server.question.entity.Question;
import e_learning.server.question.repository.QuestionAnswerRepository;
import e_learning.server.question.repository.QuestionOptionRepository;
import e_learning.server.question.service.QuestionSpecMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
public class ActivityQuestionSnapshotAssembler {
    public static final int SNAPSHOT_SCHEMA_VERSION = 2;
    private final QuestionOptionRepository optionRepository;
    private final QuestionAnswerRepository answerRepository;
    private final QuestionSpecMapper questionSpecMapper;
    private final ObjectMapper objectMapper;

    public ActivityQuestionSnapshot assemble(Question question) {
        var spec = questionSpecMapper.toSpec(question);
        var options = optionRepository.findByQuestionId(question.getId()).stream()
                .map(o -> new ActivityQuestionSnapshot.Option(o.getOptionKey(), o.getContent(), o.isCorrect())).toList();
        var answers = answerRepository.findByQuestionId(question.getId()).stream().map(a -> a.getRawValue()).toList();
        var snapshot = new ActivityQuestionSnapshot(SNAPSHOT_SCHEMA_VERSION, question.getContentRevision(), question.getType(), question.getDifficulty(),
                spec.content(), question.getExplanation(), question.getHint(), question.getMatchingMode(), options, answers, null);
        try {
            return new ActivityQuestionSnapshot(snapshot.schemaVersion(), snapshot.contentRevision(), snapshot.type(), snapshot.difficulty(),
                    snapshot.content(), snapshot.explanation(), snapshot.hint(), snapshot.matchingMode(), snapshot.options(),
                    snapshot.answers(), objectMapper.writeValueAsString(snapshot.withoutPayload()));
        } catch (Exception e) {
            throw new QuestionEngineException("Unable to serialize activity question snapshot", e);
        }
    }

    public ActivityQuestionSnapshot read(e_learning.server.activitysession.entity.ActivitySessionQuestion item) {
        if (item.getSnapshotPayload() == null || item.getSnapshotSchemaVersion() == null || item.getSnapshotContentRevision() == null) {
            throw new QuestionEngineException("Activity session question has no immutable snapshot");
        }
        try {
            ActivityQuestionSnapshot value = objectMapper.readValue(item.getSnapshotPayload(), ActivityQuestionSnapshot.class);
            return new ActivityQuestionSnapshot(item.getSnapshotSchemaVersion(), item.getSnapshotContentRevision(), value.type(), value.difficulty(),
                    value.content(), value.explanation(), value.hint(), value.matchingMode(), value.options(), value.answers(), item.getSnapshotPayload());
        } catch (Exception e) {
            throw new QuestionEngineException("Unable to read activity question snapshot", e);
        }
    }

    /** XP v2.2 requires immutable schema-v2 difficulty; live Question fallback is forbidden. */
    public void requireXpEligible(ActivityQuestionSnapshot snapshot) {
        if (snapshot == null
                || snapshot.schemaVersion() != SNAPSHOT_SCHEMA_VERSION
                || snapshot.difficulty() == null) {
            throw new QuestionEngineException(
                    "Activity XP requires a schema-v2 Question snapshot with difficulty");
        }
    }
}
