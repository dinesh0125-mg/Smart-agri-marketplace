package com.smartagri.repository;
import com.smartagri.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByCategoryNameIgnoreCase(String name);
    boolean existsByCategoryNameIgnoreCase(String name);
}
