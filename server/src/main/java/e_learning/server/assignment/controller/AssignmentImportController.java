package e_learning.server.assignment.controller;

import e_learning.server.assignment.importer.AssignmentQuestionTemplateBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/assignments")
@RequiredArgsConstructor
public class AssignmentImportController {
    private final AssignmentQuestionTemplateBuilder templateBuilder;

    @GetMapping("/question-import-template")
    public ResponseEntity<ByteArrayResource> downloadQuestionImportTemplate() {
        byte[] template = templateBuilder.build();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("assignment-question-template.xlsx")
                .build());
        headers.setContentLength(template.length);
        return ResponseEntity.ok().headers(headers).body(new ByteArrayResource(template));
    }
}
