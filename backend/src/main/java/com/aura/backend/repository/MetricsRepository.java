package com.aura.backend.repository;

import com.aura.backend.model.SystemMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MetricsRepository extends JpaRepository<SystemMetrics, Long> {
}