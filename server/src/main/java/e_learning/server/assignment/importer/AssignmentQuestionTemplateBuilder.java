package e_learning.server.assignment.importer;

import e_learning.server.content.common.enums.Difficulty;
import e_learning.server.content.common.enums.QuestionType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddressList;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Component
public class AssignmentQuestionTemplateBuilder {
    private static final List<String> HEADERS = List.of(
            "type", "content", "option_a", "option_b", "option_c", "option_d",
            "option_e", "option_f", "correct", "explanation", "difficulty");

    public byte[] build() {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            createQuestionsSheet(workbook);
            createExamplesSheet(workbook);
            createInstructionsSheet(workbook);
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Could not generate assignment question template", exception);
        }
    }

    private void createQuestionsSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Questions");
        Row header = sheet.createRow(0);
        CellStyle headerStyle = headerStyle(workbook);
        for (int index = 0; index < HEADERS.size(); index++) {
            Cell cell = header.createCell(index);
            cell.setCellValue(HEADERS.get(index));
            cell.setCellStyle(headerStyle);
        }
        sheet.createFreezePane(0, 1);
        sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, HEADERS.size() - 1));
        addListValidation(sheet, 0, QuestionType.values());
        addListValidation(sheet, 10, Difficulty.values());
        for (int index = 0; index < HEADERS.size(); index++) {
            sheet.setColumnWidth(index, index == 1 || index == 9 ? 48 * 256 : 18 * 256);
        }
    }

    private void createExamplesSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Examples");
        Row header = sheet.createRow(0);
        CellStyle headerStyle = headerStyle(workbook);
        for (int index = 0; index < HEADERS.size(); index++) {
            Cell cell = header.createCell(index);
            cell.setCellValue(HEADERS.get(index));
            cell.setCellStyle(headerStyle);
        }
        List<List<String>> examples = List.of(
                List.of("SINGLE_CHOICE", "What is the past tense of \"go\"?", "go", "went", "gone", "goes", "", "", "B", "", "EASY"),
                List.of("MULTIPLE_CHOICE", "Which are programming languages?", "Java", "HTML", "Python", "CSS", "", "", "A,C", "", "MEDIUM"),
                List.of("TRUE_FALSE", "The Earth orbits the Sun.", "", "", "", "", "", "", "TRUE", "", "EASY"),
                List.of("FILL_IN_BLANK", "Yesterday I ____ to school.", "", "", "", "", "", "", "went|did go", "", "EASY"),
                List.of("TYPE_ANSWER", "What is the largest planet?", "", "", "", "", "", "", "Jupiter", "", "EASY")
        );
        CellStyle exampleStyle = workbook.createCellStyle();
        exampleStyle.setWrapText(true);
        for (int rowIndex = 0; rowIndex < examples.size(); rowIndex++) {
            Row row = sheet.createRow(rowIndex + 1);
            row.setHeightInPoints(34);
            for (int columnIndex = 0; columnIndex < HEADERS.size(); columnIndex++) {
                Cell cell = row.createCell(columnIndex);
                cell.setCellValue(examples.get(rowIndex).get(columnIndex));
                cell.setCellStyle(exampleStyle);
            }
        }
        sheet.createFreezePane(0, 1);
        for (int index = 0; index < HEADERS.size(); index++) {
            sheet.setColumnWidth(index, index == 1 || index == 9 ? 48 * 256 : 18 * 256);
        }
    }

    private void createInstructionsSheet(Workbook workbook) {
        Sheet sheet = workbook.createSheet("Instructions");
        sheet.setColumnWidth(0, 36 * 256);
        sheet.setColumnWidth(1, 110 * 256);
        String[][] rows = {
                {"Assignment question template", "Version 1.0"},
                {"How to use", "Fill the Questions sheet, upload it, review row errors, then confirm import."},
                {"Supported file", ".xlsx only; maximum 5 MB and 100 questions."},
                {"Required fields", "type, content and correct are required."},
                {"Choice questions", "Use at least option_a and option_b. Options must be continuous from A. correct is one letter or comma-separated letters."},
                {"True/False", "Set correct to TRUE or FALSE and leave option columns empty."},
                {"Fill in the blank", "Content must contain exactly one ____ marker. Separate accepted answers with |."},
                {"Type answer", "Put one or more accepted answers in correct, separated with |."},
                {"Difficulty", "EASY, MEDIUM or HARD. Blank values default to EASY."},
                {"Important", "Do not import the Examples sheet. It is reference-only."}
        };
        CellStyle labelStyle = headerStyle(workbook);
        CellStyle valueStyle = workbook.createCellStyle();
        valueStyle.setWrapText(true);
        for (int index = 0; index < rows.length; index++) {
            Row row = sheet.createRow(index);
            row.setHeightInPoints(34);
            Cell label = row.createCell(0);
            label.setCellValue(rows[index][0]);
            label.setCellStyle(labelStyle);
            Cell value = row.createCell(1);
            value.setCellValue(rows[index][1]);
            value.setCellStyle(valueStyle);
        }
    }

    private void addListValidation(Sheet sheet, int column, Enum<?>[] values) {
        String[] names = new String[values.length];
        for (int index = 0; index < values.length; index++) names[index] = values[index].name();
        DataValidationHelper helper = sheet.getDataValidationHelper();
        DataValidationConstraint constraint = helper.createExplicitListConstraint(names);
        DataValidation validation = helper.createValidation(
                constraint, new CellRangeAddressList(1, 100, column, column));
        validation.setShowErrorBox(true);
        sheet.addValidationData(validation);
    }

    private CellStyle headerStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setWrapText(true);
        return style;
    }
}
