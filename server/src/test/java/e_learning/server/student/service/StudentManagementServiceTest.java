package e_learning.server.student.service;

import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.student.dto.CreateStudentRequest;
import e_learning.server.student.repository.StudentGuardianRepository;
import e_learning.server.student.repository.StudentProfileRepository;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentManagementServiceTest {
 @Mock UserRepository users; @Mock StudentProfileRepository profiles; @Mock StudentGuardianRepository guardians; @Mock ClassRepository classes; @Mock ClassMemberRepository members; @Mock PasswordEncoder encoder;
 @InjectMocks StudentManagementService service;

 @Test void createStudentCreatesAccountProfileAndMembership(){
  User teacher=new User("teacher@test.com","x","Teacher",Role.TEACHER);
  ClassEntity clazz=mock(ClassEntity.class); when(clazz.getTeacher()).thenReturn(teacher); when(clazz.getId()).thenReturn(7L); when(clazz.getName()).thenReturn("6A1");
  when(classes.findById(7L)).thenReturn(Optional.of(clazz)); when(users.findByEmailIgnoreCase("student@test.com")).thenReturn(Optional.empty()); when(encoder.encode("password123")).thenReturn("hash");
  when(users.save(any())).thenAnswer(i->i.getArgument(0)); when(profiles.save(any())).thenAnswer(i->i.getArgument(0)); when(members.save(any())).thenAnswer(i->i.getArgument(0)); when(guardians.findAllByStudentProfileIdOrderByPrimaryDescIdAsc(anyLong())).thenReturn(java.util.List.of());
  CreateStudentRequest request=new CreateStudentRequest("student@test.com","password123","Student",null,null,null,7L,null);
  var result=service.create(request,teacher.getId());
  assertEquals("student@test.com",result.email()); verify(users).save(any(User.class)); verify(profiles).save(any()); verify(members).save(any(ClassMember.class));
 }
 @Test void createStudentRejectsDuplicateEmail(){
  when(users.findByEmailIgnoreCase("student@test.com")).thenReturn(Optional.of(mock(User.class)));
  assertThrows(AppException.class,()->service.create(new CreateStudentRequest("student@test.com","password123","Student",null,null,null,7L,null),1L));
 }
 @Test void addToClassRejectsActiveDuplicate(){
  ClassEntity clazz=mock(ClassEntity.class); User teacher=mock(User.class); when(clazz.getTeacher()).thenReturn(teacher); when(teacher.getId()).thenReturn(1L); when(classes.findById(7L)).thenReturn(Optional.of(clazz));
  User student=mock(User.class); when(student.getRole()).thenReturn(Role.STUDENT); when(users.findById(2L)).thenReturn(Optional.of(student));
  ClassMember member=mock(ClassMember.class); when(member.getStatus()).thenReturn("ACTIVE"); when(members.findByClassEntityIdAndUserId(7L,2L)).thenReturn(Optional.of(member));
  assertThrows(AppException.class,()->service.addToClass(7L,2L,1L));
 }
 @Test void removeFromClassMarksMembershipInactive(){
  ClassEntity clazz=mock(ClassEntity.class); User teacher=mock(User.class); when(clazz.getTeacher()).thenReturn(teacher); when(teacher.getId()).thenReturn(1L); when(classes.findById(7L)).thenReturn(Optional.of(clazz));
  ClassMember member=mock(ClassMember.class); when(members.findByClassEntityIdAndUserId(7L,2L)).thenReturn(Optional.of(member));
  service.removeFromClass(7L,2L,1L); verify(member).setStatus("INACTIVE");
 }
}
