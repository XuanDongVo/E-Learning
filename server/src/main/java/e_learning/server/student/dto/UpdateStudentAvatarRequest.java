package e_learning.server.student.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Store a DiceBear style+seed key, not a free-form image URL.
 * Avatar changes must not reset StudentProfile or its guardians.
 */
public record UpdateStudentAvatarRequest(
        @NotBlank
        @Size(max = 255)
        @Pattern(regexp = "^dicebear:(adventurer|bottts|lorelei|pixel-art|fun-emoji|big-smile|notionists|open-peeps|micah|thumbs):[^:/?#]{1,40}$")
        String avatarKey
) {}
