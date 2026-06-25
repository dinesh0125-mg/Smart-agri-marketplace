package com.smartagri.repository;
import com.smartagri.entity.Farmer;
import com.smartagri.enums.FarmerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    Optional<Farmer> findByUser_Id(Long userId);
    Optional<Farmer> findByUser_Email(String email);
    List<Farmer> findByStatus(FarmerStatus status);
    long countByStatus(FarmerStatus status);
}
