package e_learning.server.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    // COMMON / SYSTEM
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", "The request is invalid"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred"),

    // AUTHENTICATION & AUTHORIZATION
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "You do not have permission to perform this action"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "The access token is invalid or expired"),

    // USER
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User was not found"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "The email is already registered"),

    // CLASS
    CLASS_ALREADY_EXISTS(HttpStatus.CONFLICT, "CLASS_ALREADY_EXISTS", "A class with this name already exists for the academic year"),

    // GRADE
    GRADE_NOT_FOUND(HttpStatus.NOT_FOUND, "GRADE_NOT_FOUND", "Grade not found"),
    GRADE_ALREADY_EXISTS(HttpStatus.CONFLICT, "GRADE_ALREADY_EXISTS", "Grade already exists"),

    // CONTENT - UNIT
    UNIT_NOT_FOUND(HttpStatus.NOT_FOUND, "UNIT_NOT_FOUND", "Unit not found"),
    UNIT_CODE_ALREADY_EXISTS(HttpStatus.CONFLICT, "UNIT_CODE_ALREADY_EXISTS", "A unit with this code already exists for this grade"),

    // CONTENT - SECTION
    SECTION_NOT_FOUND(HttpStatus.NOT_FOUND,"SECTION_NOT_FOUND","Section not found"),
    SECTION_ALREADY_EXISTS(HttpStatus.CONFLICT,"SECTION_ALREADY_EXISTS","A section with this name already exists in this unit"),
    TOPIC_NOT_FOUND(HttpStatus.NOT_FOUND, "TOPIC_NOT_FOUND", "Topic not found"),
    TOPIC_ALREADY_EXISTS(HttpStatus.CONFLICT, "TOPIC_ALREADY_EXISTS", "A topic with this name already exists in this section");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
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