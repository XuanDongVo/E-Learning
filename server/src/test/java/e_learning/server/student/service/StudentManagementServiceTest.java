package e_learning.server.student.service;

import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.student.repository.StudentGuardianRepository;
import e_learning.server.student.repository.StudentProfileRepository;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentManagementServiceTest {

    @Mock UserRepository userRepository;
    @Mock StudentProfileRepository profileRepository;
    @Mock StudentGuardianRepository guardianRepository;
    @Mock ClassRepository classRepository;
    @Mock ClassMemberRepository classMemberRepository;
    @Mock PasswordEncoder passwordEncoder;

    @Test
    void updateStatusLocksStudentWhenTeacherOwnsMembership() {
        User student = new User("student@test.com", "hash", "Student", Role.STUDENT);
        student.setStatus(UserStatus.ACTIVE);

        when(userRepository.findById(2L)).thenReturn(Optional.of(student));
        when(classMemberRepository.findAllByStudentAndTeacher(2L, 1L))
                .thenReturn(List.of(mock(ClassMember.class)));

        StudentManagementService service = new StudentManagementService(
                userRepository, profileRepository, guardianRepository,
                classRepository, classMemberRepository, passwordEncoder
        );

        service.updateStatus(2L, UserStatus.INACTIVE, 1L);

        assertEquals(UserStatus.INACTIVE, student.getStatus());
    }

    @Test
    void updateStatusRejectsStudentOutsideTeacherClasses() {
        User student = new User("student@test.com", "hash", "Student", Role.STUDENT);

        when(userRepository.findById(2L)).thenReturn(Optional.of(student));
        when(classMemberRepository.findAllByStudentAndTeacher(2L, 1L))
                .thenReturn(List.of());

        StudentManagementService service = new StudentManagementService(
                userRepository, profileRepository, guardianRepository,
                classRepository, classMemberRepository, passwordEncoder
        );

        assertThrows(AppException.class, () -> service.updateStatus(2L, UserStatus.INACTIVE, 1L));
    }
}
