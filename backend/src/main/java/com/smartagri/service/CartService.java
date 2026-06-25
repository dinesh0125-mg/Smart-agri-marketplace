package com.smartagri.service;

import com.smartagri.dto.request.CartItemRequest;
import com.smartagri.dto.response.*;
import com.smartagri.entity.*;
import com.smartagri.exception.*;
import com.smartagri.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BuyerRepository buyerRepository;
    private final ProductRepository productRepository;

    @Transactional
    public CartResponse getCart(String email) {
        Buyer buyer = getBuyer(email);
        Cart cart = cartRepository.findByBuyer_BuyerId(buyer.getBuyerId())
                .orElseGet(() -> createCart(buyer));
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(String email, CartItemRequest request) {
        Buyer buyer = getBuyer(email);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Available: " + product.getStock());
        }

        Cart cart = cartRepository.findByBuyer_BuyerId(buyer.getBuyerId())
                .orElseGet(() -> createCart(buyer));

        CartItem existing = cartItemRepository.findByCart_IdAndProduct_Id(cart.getId(), product.getId())
                .orElse(null);

        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + request.getQuantity());
            cartItemRepository.save(existing);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(item);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateCartItem(String email, Long cartItemId, Integer quantity) {
        Buyer buyer = getBuyer(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", cartItemId));

        if (!item.getCart().getBuyer().getBuyerId().equals(buyer.getBuyerId())) {
            throw new UnauthorizedException("Access denied");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        Cart cart = cartRepository.findByBuyer_BuyerId(buyer.getBuyerId()).orElseThrow();
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeFromCart(String email, Long cartItemId) {
        Buyer buyer = getBuyer(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", cartItemId));

        if (!item.getCart().getBuyer().getBuyerId().equals(buyer.getBuyerId())) {
            throw new UnauthorizedException("Access denied");
        }

        cartItemRepository.delete(item);
        Cart cart = cartRepository.findByBuyer_BuyerId(buyer.getBuyerId()).orElseThrow();
        return toResponse(cart);
    }

    @Transactional
    public void clearCart(String email) {
        Buyer buyer = getBuyer(email);
        Cart cart = cartRepository.findByBuyer_BuyerId(buyer.getBuyerId()).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }

    private Cart createCart(Buyer buyer) {
        return cartRepository.save(Cart.builder().buyer(buyer).build());
    }

    private Buyer getBuyer(String email) {
        return buyerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));
    }

    private CartResponse toResponse(Cart cart) {
        var items = cart.getItems().stream().map(item -> {
            Product p = item.getProduct();
            BigDecimal subtotal = p.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return CartItemResponse.builder()
                    .cartItemId(item.getId())
                    .productId(p.getId())
                    .productName(p.getProductName())
                    .productImage(p.getImage())
                    .price(p.getPrice())
                    .unit(p.getUnit())
                    .quantity(item.getQuantity())
                    .subtotal(subtotal)
                    .organicCertified(p.getOrganicCertified())
                    .farmerName(p.getFarmer().getUser().getFullName())
                    .farmerLocation(p.getFarmer().getFarmLocation())
                    .build();
        }).collect(Collectors.toList());

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getId())
                .items(items)
                .subtotal(subtotal)
                .totalItems(items.size())
                .build();
    }
}
