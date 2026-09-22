package e_learning.server.content.media.repository;

import e_learning.server.content.media.entity.Media;
import e_learning.server.content.media.enums.MediaStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MediaRepository
        extends JpaRepository<Media, Long> {

    Optional<Media> findByIdAndStatus(
            Long id,
            MediaStatus status
    );

    boolean existsByPublicId(String publicId);
}
