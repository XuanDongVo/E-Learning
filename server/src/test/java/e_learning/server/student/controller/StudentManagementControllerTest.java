package e_learning.server.student.controller;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.student.dto.StudentDetailResponse;
import e_learning.server.student.dto.StudentSummaryResponse;
import e_learning.server.student.service.StudentManagementService;
import e_learning.server.student.service.StudentProfileService;
import e_learning.server.student.entity.Gender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StudentManagementController.class)
class StudentManagementControllerTest {
 @Autowired MockMvc mvc;
 @MockBean StudentManagementService managementService;
 @MockBean StudentProfileService profileService;

 @Test void teacherCanListStudents() throws Exception {
  when(profileService.listForTeacher(1L)).thenReturn(List.of(new StudentSummaryResponse(2L,"Student","s@test.com","090","6A1","ACTIVE")));
  mvc.perform(get("/v1/users/students").with(SecurityMockMvcRequestPostProcessors.jwt().jwt(j->j.subject("1").claim("scope","ROLE_TEACHER"))))
   .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true)).andExpect(jsonPath("$.data[0].fullName").value("Student"));
 }
 @Test void teacherCanGetStudentDetail() throws Exception {
  when(profileService.getForTeacher(2L,1L)).thenReturn(new StudentDetailResponse(2L,"Student",null,Gender.MALE,"s@test.com","090",List.of(),7L,"6A1","ACTIVE","ACTIVE"));
  mvc.perform(get("/v1/users/students/2").with(SecurityMockMvcRequestPostProcessors.jwt().jwt(j->j.subject("1").claim("scope","ROLE_TEACHER"))))
   .andExpect(status().isOk()).andExpect(jsonPath("$.data.id").value(2));
 }
}
