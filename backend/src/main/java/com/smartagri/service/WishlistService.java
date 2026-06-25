package com.smartagri.service;

import com.smartagri.dto.response.ProductResponse;
import com.smartagri.entity.Buyer;
import com.smartagri.entity.Product;
import com.smartagri.entity.Wishlist;
import com.smartagri.exception.DuplicateResourceException;
import com.smartagri.exception.ResourceNotFoundException;
import com.smartagri.repository.BuyerRepository;
import com.smartagri.repository.ProductRepository;
import com.smartagri.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final BuyerRepository buyerRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<ProductResponse> getWishlist(String email) {
        Buyer buyer = getBuyer(email);
        return wishlistRepository.findByBuyer_BuyerId(buyer.getBuyerId()).stream()
                .map(w -> productService.toResponse(w.getProduct()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void addToWishlist(String email, Long productId) {
        Buyer buyer = getBuyer(email);
        if (wishlistRepository.existsByBuyer_BuyerIdAndProduct_Id(buyer.getBuyerId(), productId)) {
            throw new DuplicateResourceException("Product already in wishlist");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        wishlistRepository.save(Wishlist.builder().buyer(buyer).product(product).build());
    }

    @Transactional
    public void removeFromWishlist(String email, Long productId) {
        Buyer buyer = getBuyer(email);
        wishlistRepository.deleteByBuyer_BuyerIdAndProduct_Id(buyer.getBuyerId(), productId);
    }

    public boolean isInWishlist(String email, Long productId) {
        try {
            Buyer buyer = getBuyer(email);
            return wishlistRepository.existsByBuyer_BuyerIdAndProduct_Id(buyer.getBuyerId(), productId);
        } catch (Exception e) {
            return false;
        }
    }

    private Buyer getBuyer(String email) {
        return buyerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));
    }
}
