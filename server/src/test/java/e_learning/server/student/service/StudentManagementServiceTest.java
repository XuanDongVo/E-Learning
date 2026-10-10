package e_learning.server.student.service;

import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.entity.ClassStatus;
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

    private StudentManagementService service() {
        return new StudentManagementService(
                userRepository, profileRepository, guardianRepository,
                classRepository, classMemberRepository, passwordEncoder
        );
    }

    @Test
    void addToClassRejectsStudentWithAnotherActiveClass() {
        ClassEntity target = mock(ClassEntity.class);
        User teacher = mock(User.class);
        User student = mock(User.class);

        when(teacher.getId()).thenReturn(1L);
        when(target.getId()).thenReturn(20L);
        when(target.getTeacher()).thenReturn(teacher);
        when(target.getStatus()).thenReturn(ClassStatus.ACTIVE);
        when(classRepository.findById(20L)).thenReturn(Optional.of(target));
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(userRepository.findByIdForMembershipUpdate(2L)).thenReturn(Optional.of(student));
        when(classMemberRepository.findActiveMembershipByUserId(2L))
                .thenReturn(Optional.of(mock(ClassMember.class)));

        assertThrows(AppException.class, () -> service().addToClass(20L, 2L, 1L));
        verify(classMemberRepository, never()).save(any(ClassMember.class));
    }

    @Test
    void transferToClassMovesCurrentMembershipAndCreatesTargetMembership() {
        ClassEntity source = mock(ClassEntity.class);
        ClassEntity target = mock(ClassEntity.class);
        User sourceTeacher = mock(User.class);
        User student = mock(User.class);
        ClassMember current = mock(ClassMember.class);

        when(source.getId()).thenReturn(10L);
        when(source.getTeacher()).thenReturn(sourceTeacher);
        when(sourceTeacher.getId()).thenReturn(1L);
        when(target.getId()).thenReturn(20L);
        when(target.getStatus()).thenReturn(ClassStatus.ACTIVE);
        when(classRepository.findById(20L)).thenReturn(Optional.of(target));
        when(userRepository.findByIdForMembershipUpdate(2L)).thenReturn(Optional.of(student));
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(classMemberRepository.findActiveMembershipByUserId(2L))
                .thenReturn(Optional.of(current));
        when(current.getClassEntity()).thenReturn(source);
        when(classMemberRepository.findByClassEntityIdAndUserId(20L, 2L))
                .thenReturn(Optional.empty());

        service().transferToClass(20L, 2L, 1L);

        verify(current).setStatus("INACTIVE");
        verify(classMemberRepository).flush();
        verify(classMemberRepository).save(any(ClassMember.class));
    }

    @Test
    void transferToClassRejectsStudentWithNoCurrentClass() {
        ClassEntity target = mock(ClassEntity.class);
        User teacher = mock(User.class);
        User student = mock(User.class);

        when(teacher.getId()).thenReturn(1L);
        when(target.getId()).thenReturn(20L);
        when(target.getTeacher()).thenReturn(teacher);
        when(target.getStatus()).thenReturn(ClassStatus.ACTIVE);
        when(classRepository.findById(20L)).thenReturn(Optional.of(target));
        when(userRepository.findByIdForMembershipUpdate(2L)).thenReturn(Optional.of(student));
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(classMemberRepository.findActiveMembershipByUserId(2L))
                .thenReturn(Optional.empty());

        assertThrows(AppException.class, () -> service().transferToClass(20L, 2L, 1L));
        verify(classMemberRepository, never()).flush();
    }

    @Test
    void transferToClassRejectsWhenCurrentClassBelongsToAnotherTeacher() {
        ClassEntity source = mock(ClassEntity.class);
        ClassEntity target = mock(ClassEntity.class);
        User sourceTeacher = mock(User.class);
        User targetTeacher = mock(User.class);
        User student = mock(User.class);
        ClassMember current = mock(ClassMember.class);

        when(source.getId()).thenReturn(10L);
        when(source.getTeacher()).thenReturn(sourceTeacher);
        when(sourceTeacher.getId()).thenReturn(99L);
        when(target.getId()).thenReturn(20L);
        when(target.getTeacher()).thenReturn(targetTeacher);
        when(targetTeacher.getId()).thenReturn(1L);
        when(target.getStatus()).thenReturn(ClassStatus.ACTIVE);
        when(classRepository.findById(20L)).thenReturn(Optional.of(target));
        when(userRepository.findByIdForMembershipUpdate(2L)).thenReturn(Optional.of(student));
        when(student.getRole()).thenReturn(Role.STUDENT);
        when(classMemberRepository.findActiveMembershipByUserId(2L))
                .thenReturn(Optional.of(current));
        when(current.getClassEntity()).thenReturn(source);

        assertThrows(AppException.class, () -> service().transferToClass(20L, 2L, 1L));
        verify(current, never()).setStatus("INACTIVE");
        verify(classMemberRepository, never()).flush();
    }

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
