package e_learning.server.content.questionBank.importcsv;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.question.dto.CreateQuestionRequest;
import e_learning.server.content.questionBank.importcsv.dto.CsvValidationResult;
import e_learning.server.content.questionBank.importcsv.dto.CsvValidationResult.CsvImportError;
import e_learning.server.content.questionBank.importcsv.dto.CsvValidationResult.ValidImportedQuestion;
import e_learning.server.content.questionBank.repository.QuestionBankRepository;
import e_learning.server.question.dto.request.QuestionAnswerRequest;
import e_learning.server.question.dto.request.QuestionOptionRequest;
import e_learning.server.question.engine.core.QuestionEngine;
import e_learning.server.question.engine.result.DefinitionValidation;
import e_learning.server.question.engine.types.text.MatchingMode;
import e_learning.server.question.enums.Difficulty;
import e_learning.server.question.enums.QuestionType;
import e_learning.server.question.service.QuestionSpecRequestFactory;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.Reader;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.StandardCharsets;
import java.nio.charset.CodingErrorAction;
import java.nio.CharBuffer;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionBankCsvImportService {
    private static final long MAX_FILE_BYTES = 2L * 1024 * 1024;
    private static final int MAX_DATA_ROWS = 1000;
    private static final List<String> HEADERS = List.of(
            "type", "difficulty", "content", "option_a", "option_b",
            "option_c", "option_d", "correct_answer", "explanation", "hint"
    );
    private static final Set<String> CHOICE_TYPES = Set.of("SINGLE_CHOICE", "MULTIPLE_CHOICE");
    private static final String ANSWER_SEPARATOR = "|";

    private final QuestionBankRepository questionBankRepository;
    private final QuestionEngine questionEngine;
    private final QuestionSpecRequestFactory questionSpecRequestFactory;
    private final Validator validator;

    public CsvValidationResult validate(Long bankId, MultipartFile file) {
        if (!questionBankRepository.existsById(bankId)) {
            throw new AppException(ErrorCode.QUESTION_BANK_NOT_FOUND);
        }
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "CSV file must not be empty");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "CSV file exceeds the 2 MB limit");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase(Locale.ROOT).endsWith(".csv")) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Only .csv files are supported");
        }

        String csv = decodeUtf8(file);
        List<ValidImportedQuestion> valid = new ArrayList<>();
        List<CsvImportError> errors = new ArrayList<>();
        int total = 0;
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreEmptyLines(false)
                .get();

        try (Reader reader = new StringReader(csv); CSVParser parser = format.parse(reader)) {
            validateHeaders(parser.getHeaderNames());
            for (CSVRecord record : parser) {
                if (++total > MAX_DATA_ROWS) {
                    throw new AppException(ErrorCode.INVALID_REQUEST, "CSV exceeds the 1000 question limit");
                }
                // Logical CSV row number (header is 1); quoted multiline fields remain one record.
                long row = record.getRecordNumber() + 1;
                if (!record.isConsistent()) {
                    errors.add(error(row, "row", "INVALID_COLUMN_COUNT",
                            "Row has a different number of columns from the header", null));
                    continue;
                }
                int previousErrorCount = errors.size();
                CreateQuestionRequest question = parseRow(bankId, row, record, errors);
                if (errors.size() == previousErrorCount && question != null) {
                    valid.add(new ValidImportedQuestion(row, question));
                }
            }
        } catch (IOException | IllegalArgumentException ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "CSV could not be parsed: " + ex.getMessage());
        }

        int invalid = total - valid.size();
        return new CsvValidationResult(filename, total, valid.size(), invalid, valid, errors);
    }

    private String decodeUtf8(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            if (bytes.length > MAX_FILE_BYTES) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "CSV file exceeds the 2 MB limit");
            }
            CharBuffer decoded = StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes));
            String value = decoded.toString();
            return value.startsWith("\uFEFF") ? value.substring(1) : value;
        } catch (CharacterCodingException ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "CSV must be encoded as UTF-8");
        } catch (IOException ex) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "CSV could not be read");
        }
    }

    private void validateHeaders(List<String> headers) {
        if (headers.size() != HEADERS.size()
                || new HashSet<>(headers).size() != HEADERS.size()
                || !headers.equals(HEADERS)) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                    "Invalid CSV header. Expected columns in order: " + String.join(",", HEADERS));
        }
    }

    private CreateQuestionRequest parseRow(Long bankId, long row, CSVRecord record, List<CsvImportError> errors) {
        String typeText = cell(record, "type").toUpperCase(Locale.ROOT);
        QuestionType type = null;
        try {
            type = QuestionType.valueOf(typeText);
            if (type == QuestionType.MATCHING || type == QuestionType.CLOZE) {
                errors.add(error(row, "type", "UNSUPPORTED_QUESTION_TYPE",
                        "MATCHING and CLOZE are not supported in Question Bank CSV", typeText));
                return null;
            }
        } catch (IllegalArgumentException ex) {
            errors.add(error(row, "type", "INVALID_QUESTION_TYPE",
                    "Unrecognized question type", typeText));
            return null;
        }

        Difficulty difficulty;
        try {
            difficulty = Difficulty.valueOf(cell(record, "difficulty").toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            errors.add(error(row, "difficulty", "INVALID_DIFFICULTY",
                    "Use EASY, MEDIUM, or HARD", cell(record, "difficulty")));
            return null;
        }

        CreateQuestionRequest question = new CreateQuestionRequest();
        question.setQuestionBankId(bankId);
        question.setType(type);
        question.setDifficulty(difficulty);
        question.setContent(cell(record, "content"));
        question.setExplanation(optional(cell(record, "explanation")));
        question.setHint(optional(cell(record, "hint")));
        question.setMatchingMode(MatchingMode.CASE_INSENSITIVE_TRIM);

        for (ConstraintViolation<CreateQuestionRequest> violation : validator.validate(question)) {
            errors.add(error(row, violation.getPropertyPath().toString(), "INVALID_FIELD",
                    violation.getMessage(), null));
        }
        if (!errors.isEmpty() && errors.get(errors.size() - 1).rowNumber() == row) return null;

        String answer = cell(record, "correct_answer");
        if (CHOICE_TYPES.contains(type.name())) {
            parseChoice(row, record, answer, type, question, errors);
        } else {
            for (String option : List.of("option_a", "option_b", "option_c", "option_d")) {
                if (!cell(record, option).isEmpty()) {
                    errors.add(error(row, option, "UNEXPECTED_OPTION",
                            "Options are only allowed for choice questions", cell(record, option)));
                }
            }
            parseAnswer(row, answer, type, question, errors);
        }
        if (!errors.isEmpty() && errors.get(errors.size() - 1).rowNumber() == row) return null;

        DefinitionValidation validation = questionEngine.validateDefinition(questionSpecRequestFactory.toSpec(question));
        if (!validation.isReady()) {
            for (String code : validation.errors()) {
                errors.add(error(row, "question", "QUESTION_NOT_READY", code, null));
            }
            if (validation.errors().isEmpty()) {
                errors.add(error(row, "question", "QUESTION_NOT_READY",
                        "Question is not ready for saving", null));
            }
            return null;
        }
        return question;
    }

    private void parseChoice(long row, CSVRecord record, String rawAnswer,
                             QuestionType type, CreateQuestionRequest question, List<CsvImportError> errors) {
        String[] cells = {
                cell(record, "option_a"), cell(record, "option_b"),
                cell(record, "option_c"), cell(record, "option_d")
        };
        int count = 0;
        boolean gap = false;
        Set<String> normalizedOptions = new HashSet<>();
        for (int i = 0; i < cells.length; i++) {
            if (cells[i].isBlank()) {
                gap = true;
            } else {
                if (gap) errors.add(error(row, "option_" + (char) ('a' + i), "OPTION_GAP",
                        "Options must be contiguous starting from A", cells[i]));
                count++;
                if (!normalizedOptions.add(cells[i].toLowerCase(Locale.ROOT))) {
                    errors.add(error(row, "option_" + (char) ('a' + i), "DUPLICATE_OPTION",
                            "Choice options must be distinct", cells[i]));
                }
            }
        }
        if (count < 2) errors.add(error(row, "option_a", "TOO_FEW_OPTIONS",
                "Choice questions need at least two nonempty options", null));

        List<String> answers = tokens(rawAnswer);
        Set<String> selected = new HashSet<>();
        for (String value : answers) {
            String token = value.toUpperCase(Locale.ROOT);
            if (!token.matches("[A-D]") || token.charAt(0) - 'A' >= count) {
                errors.add(error(row, "correct_answer", "INVALID_CORRECT_OPTION",
                        "Answer must reference an existing choice A-D", token));
            } else if (!selected.add(token)) {
                errors.add(error(row, "correct_answer", "DUPLICATE_CORRECT_OPTION",
                        "Correct answer cannot repeat an option", token));
            }
        }
        if (selected.isEmpty()) errors.add(error(row, "correct_answer", "MISSING_CORRECT_ANSWER",
                "At least one correct option is required", rawAnswer));
        if (type == QuestionType.SINGLE_CHOICE && selected.size() != 1) {
            errors.add(error(row, "correct_answer", "SINGLE_CHOICE_REQUIRES_ONE",
                    "Single choice requires exactly one correct option", rawAnswer));
        }
        if (!errors.isEmpty() && errors.get(errors.size() - 1).rowNumber() == row) return;

        List<QuestionOptionRequest> options = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            QuestionOptionRequest option = new QuestionOptionRequest();
            option.setContent(cells[i]);
            option.setCorrect(selected.contains(String.valueOf((char) ('A' + i))));
            options.add(option);
        }
        question.setOptions(options);
    }

    private void parseAnswer(long row, String answer, QuestionType type,
                             CreateQuestionRequest question, List<CsvImportError> errors) {
        if (type == QuestionType.TRUE_FALSE) {
            if (!"TRUE".equalsIgnoreCase(answer) && !"FALSE".equalsIgnoreCase(answer)) {
                errors.add(error(row, "correct_answer", "INVALID_TRUE_FALSE",
                        "Use TRUE or FALSE", answer));
                return;
            }
            question.setAnswers(List.of(answerRequest(answer.toUpperCase(Locale.ROOT))));
            return;
        }

        if (answer.isBlank()) {
            errors.add(error(row, "correct_answer", "MISSING_CORRECT_ANSWER",
                    "At least one accepted answer is required", answer));
            return;
        }
        List<String> answers = tokens(answer);
        if (answers.isEmpty() || answers.stream().anyMatch(String::isBlank)) {
            errors.add(error(row, "correct_answer", "INVALID_ANSWER_LIST",
                    "Accepted answers must be nonempty and separated by |", answer));
            return;
        }
        question.setAnswers(answers.stream().map(this::answerRequest).toList());
    }

    private List<String> tokens(String answer) {
        return List.of(answer.split("\\|", -1))
                .stream().map(String::trim).toList();
    }

    private QuestionAnswerRequest answerRequest(String value) {
        QuestionAnswerRequest answer = new QuestionAnswerRequest();
        answer.setRawValue(value);
        return answer;
    }

    private String cell(CSVRecord record, String header) {
        return record.get(header).trim();
    }

    private String optional(String value) {
        return value.isBlank() ? null : value;
    }

    private CsvImportError error(long row, String field, String code, String message, String raw) {
        return new CsvImportError(row, field, code, message, raw);
    }
}
