package e_learning.server.user.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.dto.CreateStudentRequest;
import e_learning.server.user.dto.UserResponse;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse createStudent(CreateStudentRequest request) {
        if (userRepository.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User student = new User(
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                Role.STUDENT
        );
        return UserResponse.from(userRepository.save(student));
    }
}