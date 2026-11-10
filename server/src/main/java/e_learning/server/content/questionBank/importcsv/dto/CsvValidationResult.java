package e_learning.server.content.questionBank.importcsv.dto;

import e_learning.server.content.question.dto.CreateQuestionRequest;
import java.util.List;

public record CsvValidationResult(
        String fileName,
        int totalRows,
        int validCount,
        int invalidCount,
        List<ValidImportedQuestion> validQuestions,
        List<CsvImportError> errors
) {
    public CsvValidationResult {
        validQuestions = List.copyOf(validQuestions);
        errors = List.copyOf(errors);
    }

    public record ValidImportedQuestion(long rowNumber, CreateQuestionRequest question) {}

    public record CsvImportError(
            long rowNumber,
            String field,
            String code,
            String message,
            String rawValue
    ) {}
}
