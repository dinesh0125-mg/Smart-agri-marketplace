package com.smartagri.repository;
import com.smartagri.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface BuyerRepository extends JpaRepository<Buyer, Long> {
    Optional<Buyer> findByUser_Id(Long userId);
    Optional<Buyer> findByUser_Email(String email);
}
