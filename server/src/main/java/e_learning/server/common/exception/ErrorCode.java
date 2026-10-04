package e_learning.server.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "The request is invalid"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to perform this action"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "The access token is invalid or expired"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User was not found"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "The email is already registered"),
    CLASS_ALREADY_EXISTS(HttpStatus.CONFLICT, "CLASS_ALREADY_EXISTS", "A class with this name already exists for the academic year"),
    CLASS_NOT_FOUND(HttpStatus.NOT_FOUND, "CLASS_NOT_FOUND", "Class not found"),
    GRADE_NOT_FOUND(HttpStatus.NOT_FOUND, "GRADE_NOT_FOUND", "Grade not found"),
    GRADE_ALREADY_EXISTS(HttpStatus.CONFLICT, "GRADE_ALREADY_EXISTS", "Grade already exists"),
    UNIT_NOT_FOUND(HttpStatus.NOT_FOUND, "UNIT_NOT_FOUND", "Unit not found"),
    UNIT_CODE_ALREADY_EXISTS(HttpStatus.CONFLICT, "UNIT_CODE_ALREADY_EXISTS", "A unit with this code already exists for this grade"),
    SECTION_NOT_FOUND(HttpStatus.NOT_FOUND, "SECTION_NOT_FOUND", "Section not found"),
    SECTION_ALREADY_EXISTS(HttpStatus.CONFLICT, "SECTION_ALREADY_EXISTS", "A section with this name already exists in this unit"),
    TOPIC_NOT_FOUND(HttpStatus.NOT_FOUND, "TOPIC_NOT_FOUND", "Topic not found"),
    TOPIC_ALREADY_EXISTS(HttpStatus.CONFLICT, "TOPIC_ALREADY_EXISTS", "A topic with this name already exists in this section"),
    QUESTION_BANK_NOT_FOUND(HttpStatus.NOT_FOUND, "QUESTION_BANK_NOT_FOUND", "Question bank not found"),
    QUESTION_BANK_ALREADY_EXISTS(HttpStatus.CONFLICT, "QUESTION_BANK_ALREADY_EXISTS", "A question bank with this name already exists in this topic"),
    QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "QUESTION_NOT_FOUND", "Question not found"),
    EMPTY_QUESTION(HttpStatus.NOT_FOUND, "EMPTY_QUESTION", ""),
    ACTIVITY_NOT_FOUND(HttpStatus.NOT_FOUND, "ACTIVITY_NOT_FOUND", "Activity not found"),
    ACTIVITY_ALREADY_EXISTS(HttpStatus.CONFLICT, "ACTIVITY_ALREADY_EXISTS", "An activity with this name already exists in this unit"),
    ACTIVITY_INVALID_CONFIGURATION(HttpStatus.BAD_REQUEST, "ACTIVITY_INVALID_CONFIGURATION", "The activity configuration is invalid"),
    ACTIVITY_NOT_READY(HttpStatus.CONFLICT, "ACTIVITY_NOT_READY", "The activity is not ready to be published"),
    ACTIVITY_QUESTION_BANK_OUTSIDE_UNIT(HttpStatus.BAD_REQUEST, "ACTIVITY_QUESTION_BANK_OUTSIDE_UNIT", "The question bank must belong to the same unit as the activity"),
    ASSIGNMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "ASSIGNMENT_NOT_FOUND", "Assignment not found"),
    ASSIGNMENT_INVALID_CONFIGURATION(HttpStatus.BAD_REQUEST, "ASSIGNMENT_INVALID_CONFIGURATION", "The assignment configuration is invalid"),
    ASSIGNMENT_TARGET_REQUIRED(HttpStatus.BAD_REQUEST, "ASSIGNMENT_TARGET_REQUIRED", "At least one assignment target is required"),
    ASSIGNMENT_TARGET_INVALID(HttpStatus.BAD_REQUEST, "ASSIGNMENT_TARGET_INVALID", "The assignment target is invalid"),
    ASSIGNMENT_SCHEDULE_INVALID(HttpStatus.BAD_REQUEST, "ASSIGNMENT_SCHEDULE_INVALID", "The assignment schedule is invalid"),
    ASSIGNMENT_TIME_LIMIT_INVALID(HttpStatus.BAD_REQUEST, "ASSIGNMENT_TIME_LIMIT_INVALID", "The assignment time limit is invalid"),
    ASSIGNMENT_QUESTION_LIMIT_EXCEEDED(HttpStatus.BAD_REQUEST, "ASSIGNMENT_QUESTION_LIMIT_EXCEEDED", "An assignment cannot contain more than 100 questions"),
    ASSIGNMENT_QUESTIONS_LOCKED(HttpStatus.CONFLICT, "ASSIGNMENT_QUESTIONS_LOCKED", "Assignment questions cannot be changed in the current assignment state");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status; this.code = code; this.message = message;
    }
    public HttpStatus status() { return status; }
    public String code() { return code; }
    public String message() { return message; }
}
