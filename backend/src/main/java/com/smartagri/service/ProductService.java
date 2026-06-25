package com.smartagri.service;

import com.smartagri.dto.request.ProductRequest;
import com.smartagri.dto.response.ProductResponse;
import com.smartagri.entity.Category;
import com.smartagri.entity.Farmer;
import com.smartagri.entity.Product;
import com.smartagri.exception.ResourceNotFoundException;
import com.smartagri.exception.UnauthorizedException;
import com.smartagri.repository.CategoryRepository;
import com.smartagri.repository.FarmerRepository;
import com.smartagri.repository.ProductRepository;
import com.smartagri.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final FarmerRepository farmerRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> searchProducts(String query, Long categoryId, BigDecimal minPrice,
                                                 BigDecimal maxPrice, Boolean organic, String sortBy,
                                                 String direction, int page, int size) {
        Sort sort = buildSort(sortBy, direction);
        Pageable pageable = PageRequest.of(page, size, sort);
        return productRepository
                .searchProducts(query, categoryId, minPrice, maxPrice, organic, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByFeaturedTrue().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getFarmerProducts(Long farmerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByFarmer_FarmerId(farmerId, pageable).map(this::toResponse);
    }

    @Transactional
    public ProductResponse createProduct(String farmerEmail, ProductRequest request, MultipartFile image) {
        Farmer farmer = farmerRepository.findByUser_Email(farmerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
        }

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image, "products");
        } else if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            // Use the external URL provided (Unsplash, gallery link, etc.)
            imageUrl = request.getImageUrl();
        }

        Product product = Product.builder()
                .farmer(farmer)
                .category(category)
                .productName(request.getProductName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .unit(request.getUnit())
                .image(imageUrl)
                .organicCertified(request.getOrganicCertified())
                .featured(request.getFeatured())
                .discount(request.getDiscount())
                .build();

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long productId, String userEmail,
                                          ProductRequest request, MultipartFile image) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        Farmer farmer = farmerRepository.findByUser_Email(userEmail).orElse(null);
        if (farmer == null || !farmer.getFarmerId().equals(product.getFarmer().getFarmerId())) {
            throw new UnauthorizedException("You don't have permission to update this product");
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            product.setCategory(category);
        }

        if (image != null && !image.isEmpty()) {
            // Only delete old image from Cloudinary if it was actually hosted there
            if (product.getImage() != null && product.getImage().contains("cloudinary.com")) {
                cloudinaryService.deleteImage(product.getImage());
            }
            product.setImage(cloudinaryService.uploadImage(image, "products"));
        } else if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            // External URL provided — store it directly (no Cloudinary upload needed)
            product.setImage(request.getImageUrl());
        }
        // If neither file nor URL provided, keep the existing image unchanged

        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setUnit(request.getUnit());
        product.setOrganicCertified(request.getOrganicCertified());
        product.setFeatured(request.getFeatured());
        product.setDiscount(request.getDiscount());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long productId, String userEmail, boolean isAdmin) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        if (!isAdmin) {
            if (userEmail == null || !product.getFarmer().getUser().getEmail().equals(userEmail)) {
                throw new UnauthorizedException("You don't have permission to delete this product");
            }
        }

        if (product.getImage() != null) cloudinaryService.deleteImage(product.getImage());
        productRepository.delete(product);
    }

    public ProductResponse toResponse(Product product) {
        Double avgRating = reviewRepository.getAverageRating(product.getId());
        long reviewCount = reviewRepository.countByProduct_Id(product.getId());

        return ProductResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .unit(product.getUnit())
                .image(product.getImage())
                .organicCertified(product.getOrganicCertified())
                .featured(product.getFeatured())
                .discount(product.getDiscount())
                .createdAt(product.getCreatedAt())
                .farmerId(product.getFarmer().getFarmerId())
                .farmerName(product.getFarmer().getUser().getFullName())
                .farmerLocation(product.getFarmer().getFarmLocation())
                .farmerImage(product.getFarmer().getUser().getProfileImage())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount(reviewCount)
                .build();
    }

    private Sort buildSort(String sortBy, String direction) {
        String field = switch (sortBy != null ? sortBy : "createdAt") {
            case "price" -> "price";
            case "name"  -> "productName";
            default      -> "createdAt";
        };
        return (direction != null && direction.equalsIgnoreCase("asc"))
                ? Sort.by(field).ascending()
                : Sort.by(field).descending();
    }
}
