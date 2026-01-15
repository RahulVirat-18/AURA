package com.aura.backend.repository;
import com.aura.backend.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByUserIdOrderByTimestampDesc(Long userId);
}