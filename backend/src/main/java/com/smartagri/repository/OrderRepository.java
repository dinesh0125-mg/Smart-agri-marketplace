package com.smartagri.repository;
import com.smartagri.entity.Order;
import com.smartagri.enums.OrderStatus;
import com.smartagri.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByBuyer_BuyerIdOrderByCreatedAtDesc(Long buyerId, Pageable pageable);
    List<Order> findByBuyer_BuyerId(Long buyerId);
    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);
    long countByOrderStatus(OrderStatus status);
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'SUCCESS'")
    BigDecimal getTotalRevenue();
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.paymentStatus = 'SUCCESS' AND o.createdAt BETWEEN :start AND :end")
    BigDecimal getRevenueByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    @Query("SELECT FUNCTION('MONTH', o.createdAt) as month, SUM(o.totalAmount) as revenue FROM Order o WHERE o.paymentStatus = 'SUCCESS' AND FUNCTION('YEAR', o.createdAt) = :year GROUP BY FUNCTION('MONTH', o.createdAt)")
    List<Object[]> getMonthlyRevenue(@Param("year") int year);
    @Query("SELECT o FROM Order o JOIN o.orderItems oi WHERE oi.product.farmer.farmerId = :farmerId")
    Page<Order> findByFarmerId(@Param("farmerId") Long farmerId, Pageable pageable);
    @Query("SELECT COUNT(o) FROM Order o WHERE o.buyer.buyerId = :buyerId AND o.orderStatus = 'DELIVERED'")
    long countDeliveredOrdersByBuyer(@Param("buyerId") Long buyerId);
}
