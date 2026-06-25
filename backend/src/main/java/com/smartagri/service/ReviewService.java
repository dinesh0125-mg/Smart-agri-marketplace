package com.smartagri.service;

import com.smartagri.dto.request.ReviewRequest;
import com.smartagri.dto.response.ReviewResponse;
import com.smartagri.entity.Buyer;
import com.smartagri.entity.Product;
import com.smartagri.entity.Review;
import com.smartagri.exception.BadRequestException;
import com.smartagri.exception.DuplicateResourceException;
import com.smartagri.exception.ResourceNotFoundException;
import com.smartagri.exception.UnauthorizedException;
import com.smartagri.repository.BuyerRepository;
import com.smartagri.repository.OrderRepository;
import com.smartagri.repository.ProductRepository;
import com.smartagri.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final BuyerRepository buyerRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviews(Long productId) {
        return reviewRepository.findByProduct_IdOrderByCreatedAtDesc(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse addReview(String email, Long productId, ReviewRequest request) {
        Buyer buyer = buyerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        long deliveredOrders = orderRepository.countDeliveredOrdersByBuyer(buyer.getBuyerId());
        if (deliveredOrders == 0) {
            throw new BadRequestException("You can only review products from completed orders");
        }
        if (reviewRepository.findByProduct_IdAndBuyer_BuyerId(productId, buyer.getBuyerId()).isPresent()) {
            throw new DuplicateResourceException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .product(product)
                .buyer(buyer)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public ReviewResponse updateReview(String email, Long reviewId, ReviewRequest request) {
        Buyer buyer = buyerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
        if (!review.getBuyer().getBuyerId().equals(buyer.getBuyerId())) {
            throw new UnauthorizedException("Access denied");
        }
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(String email, Long reviewId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
        if (!isAdmin) {
            Buyer buyer = buyerRepository.findByUser_Email(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));
            if (!review.getBuyer().getBuyerId().equals(buyer.getBuyerId())) {
                throw new UnauthorizedException("Access denied");
            }
        }
        reviewRepository.delete(review);
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .productId(r.getProduct().getId())
                .buyerId(r.getBuyer().getBuyerId())
                .buyerName(r.getBuyer().getUser().getFullName())
                .buyerImage(r.getBuyer().getUser().getProfileImage())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
