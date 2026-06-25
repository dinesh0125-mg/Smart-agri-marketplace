package com.smartagri.repository;
import com.smartagri.entity.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {}
