package e_learning.server.content.questionBank.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.content.questionBank.importcsv.QuestionBankCsvImportService;
import e_learning.server.content.questionBank.importcsv.dto.CsvValidationResult;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/content/question-banks")
@RequiredArgsConstructor
public class QuestionBankCsvImportController {
    private final QuestionBankCsvImportService importService;

    // Validation only: no Question or QuestionBank is persisted by this endpoint.
    @PostMapping(value = "/{bankId}/questions/import/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CsvValidationResult>> validate(
            @PathVariable Long bankId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.success(importService.validate(bankId, file)));
    }
}
