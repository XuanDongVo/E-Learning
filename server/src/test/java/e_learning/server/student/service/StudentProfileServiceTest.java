package e_learning.server.student.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.student.entity.StudentProfile;
import e_learning.server.student.repository.StudentGuardianRepository;
import e_learning.server.student.repository.StudentProfileRepository;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class StudentProfileServiceTest {
 @Mock UserRepository users; @Mock StudentProfileRepository profiles; @Mock StudentGuardianRepository guardians; @Mock ClassMemberRepository members;
 @InjectMocks StudentProfileService service;

 @Test void getOwnProfileRejectsNonStudent(){
  User teacher=mock(User.class); when(teacher.getRole()).thenReturn(Role.TEACHER); when(users.findById(1L)).thenReturn(java.util.Optional.of(teacher));
  assertThrows(AppException.class,()->service.getOwnProfile(1L));
 }
 @Test void getOwnProfileReturnsProfileData(){
  User student=mock(User.class); when(student.getRole()).thenReturn(Role.STUDENT); when(student.getId()).thenReturn(1L); when(student.getEmail()).thenReturn("s@test.com"); when(student.getFullName()).thenReturn("Student"); when(student.getStatus()).thenReturn(e_learning.server.user.entity.UserStatus.ACTIVE);
  StudentProfile profile=mock(StudentProfile.class); when(profile.getId()).thenReturn(9L); when(profiles.findByUserId(1L)).thenReturn(java.util.Optional.of(profile)); when(guardians.findAllByStudentProfileIdOrderByPrimaryDescIdAsc(9L)).thenReturn(java.util.List.of()); when(members.findActiveMembershipsByUserId(1L)).thenReturn(java.util.List.of());
  assertEquals("Student",service.getOwnProfile(1L).data().fullName());
 }
}
