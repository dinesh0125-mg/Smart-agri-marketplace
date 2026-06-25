package com.smartagri.repository;
import com.smartagri.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByFarmer_FarmerId(Long farmerId, Pageable pageable);
    List<Product> findByFarmer_FarmerId(Long farmerId);
    List<Product> findByCategory_Id(Long categoryId);
    @Query("SELECT p FROM Product p WHERE " +
           "(:query IS NULL OR LOWER(p.productName) LIKE LOWER(CONCAT('%',:query,'%')) OR LOWER(p.farmer.farmName) LIKE LOWER(CONCAT('%',:query,'%'))) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:organic IS NULL OR p.organicCertified = :organic)")
    Page<Product> searchProducts(@Param("query") String query,
                                  @Param("categoryId") Long categoryId,
                                  @Param("minPrice") BigDecimal minPrice,
                                  @Param("maxPrice") BigDecimal maxPrice,
                                  @Param("organic") Boolean organic,
                                  Pageable pageable);
    List<Product> findByFeaturedTrue();
    long countByFarmer_FarmerId(Long farmerId);
}
