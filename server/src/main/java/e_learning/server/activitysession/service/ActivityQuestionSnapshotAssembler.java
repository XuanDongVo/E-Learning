package e_learning.server.activitysession.service;

import e_learning.server.activitysession.entity.ActivityQuestionSnapshot;
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
    private static final int SNAPSHOT_SCHEMA_VERSION = 1;
    private final QuestionOptionRepository optionRepository;
    private final QuestionAnswerRepository answerRepository;
    private final QuestionSpecMapper questionSpecMapper;
    private final ObjectMapper objectMapper;

    public ActivityQuestionSnapshot assemble(Question question) {
        var spec = questionSpecMapper.toSpec(question);
        var options = optionRepository.findByQuestionId(question.getId()).stream()
                .map(o -> new ActivityQuestionSnapshot.Option(o.getOptionKey(), o.getContent(), o.isCorrect())).toList();
        var answers = answerRepository.findByQuestionId(question.getId()).stream().map(a -> a.getRawValue()).toList();
        var snapshot = new ActivityQuestionSnapshot(SNAPSHOT_SCHEMA_VERSION, question.getContentRevision(),
                question.getType(), spec.content(), question.getExplanation(), question.getHint(),
                question.getMatchingMode(), options, answers, null);
        try {
            return new ActivityQuestionSnapshot(snapshot.schemaVersion(), snapshot.contentRevision(), snapshot.type(),
                    snapshot.content(), snapshot.explanation(), snapshot.hint(), snapshot.matchingMode(),
                    snapshot.options(), snapshot.answers(), objectMapper.writeValueAsString(snapshot.withoutPayload()));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to serialize activity question snapshot", e);
        }
    }

    public ActivityQuestionSnapshot read(e_learning.server.activitysession.entity.ActivitySessionQuestion item) {
        if (item.getSnapshotPayload() == null || item.getSnapshotSchemaVersion() == null
                || item.getSnapshotContentRevision() == null) {
            throw new IllegalStateException("Activity session question has no immutable snapshot");
        }
        try {
            ActivityQuestionSnapshot value = objectMapper.readValue(item.getSnapshotPayload(), ActivityQuestionSnapshot.class);
            return new ActivityQuestionSnapshot(item.getSnapshotSchemaVersion(), item.getSnapshotContentRevision(),
                    value.type(), value.content(), value.explanation(), value.hint(), value.matchingMode(),
                    value.options(), value.answers(), item.getSnapshotPayload());
        } catch (Exception e) {
            throw new IllegalStateException("Unable to read activity question snapshot", e);
        }
    }
}
