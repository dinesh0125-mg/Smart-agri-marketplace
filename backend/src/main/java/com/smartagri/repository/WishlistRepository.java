package com.smartagri.repository;
import com.smartagri.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByBuyer_BuyerId(Long buyerId);
    Optional<Wishlist> findByBuyer_BuyerIdAndProduct_Id(Long buyerId, Long productId);
    boolean existsByBuyer_BuyerIdAndProduct_Id(Long buyerId, Long productId);
    void deleteByBuyer_BuyerIdAndProduct_Id(Long buyerId, Long productId);
}
