package e_learning.server.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "The request is invalid"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to perform this action"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "The access token is invalid or expired"),

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User was not found"),
    STUDENT_NOT_FOUND(HttpStatus.NOT_FOUND, "STUDENT_NOT_FOUND", "Student was not found"),
    STUDENT_PROFILE_NOT_FOUND(HttpStatus.NOT_FOUND, "STUDENT_PROFILE_NOT_FOUND", "Student profile was not found"),
    STUDENT_ALREADY_IN_CLASS(HttpStatus.CONFLICT, "STUDENT_ALREADY_IN_CLASS", "Student is already in this class"),
    STUDENT_NOT_IN_ACTIVE_CLASS(HttpStatus.FORBIDDEN, "STUDENT_NOT_IN_ACTIVE_CLASS", "Student does not belong to an active class"),
    CLASS_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "CLASS_MEMBER_NOT_FOUND", "Class membership was not found"),
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
    ASSIGNMENT_QUESTIONS_LOCKED(HttpStatus.CONFLICT, "ASSIGNMENT_QUESTIONS_LOCKED", "Assignment questions cannot be changed in the current assignment state"),

    ACTIVITY_SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "ACTIVITY_SESSION_NOT_FOUND", "Activity session was not found"),
    ACTIVITY_SESSION_INVALID_MODE(HttpStatus.BAD_REQUEST, "ACTIVITY_SESSION_INVALID_MODE", "The selected activity mode is not available"),
    ACTIVITY_SESSION_INVALID_STRATEGY(HttpStatus.BAD_REQUEST, "ACTIVITY_SESSION_INVALID_STRATEGY", "The selected question strategy is not available"),
    ACTIVITY_SESSION_NOT_ACCESSIBLE(HttpStatus.FORBIDDEN, "ACTIVITY_SESSION_NOT_ACCESSIBLE", "The student cannot access this activity"),
    ACTIVITY_SESSION_NOT_ACTIVE(HttpStatus.CONFLICT, "ACTIVITY_SESSION_NOT_ACTIVE", "The activity session is not in progress"),
    ACTIVITY_SESSION_QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "ACTIVITY_SESSION_QUESTION_NOT_FOUND", "The session question was not found"),
    ACTIVITY_SESSION_ANSWER_INVALID(HttpStatus.BAD_REQUEST, "ACTIVITY_SESSION_ANSWER_INVALID", "The answer is invalid for this question"),
    ACTIVITY_SESSION_RETRY_EXHAUSTED(HttpStatus.CONFLICT, "ACTIVITY_SESSION_RETRY_EXHAUSTED", "No retry is available for this question"),
    ACTIVITY_SESSION_HINT_UNAVAILABLE(HttpStatus.CONFLICT, "ACTIVITY_SESSION_HINT_UNAVAILABLE", "A hint is not available for this question"),
    ACTIVITY_SESSION_NOT_READY(HttpStatus.CONFLICT, "ACTIVITY_SESSION_NOT_READY", "The activity is not ready");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus s, String c, String m) {
        status = s;
        code = c;
        message = m;
    }

    public HttpStatus status() {
        return status;
    }

    public String code() {
        return code;
    }

    public String message() {
        return message;
    }
}