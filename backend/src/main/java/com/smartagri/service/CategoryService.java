package com.smartagri.service;

import com.smartagri.dto.request.CategoryRequest;
import com.smartagri.dto.response.CategoryResponse;
import com.smartagri.entity.Category;
import com.smartagri.exception.BadRequestException;
import com.smartagri.exception.DuplicateResourceException;
import com.smartagri.exception.ResourceNotFoundException;
import com.smartagri.repository.CategoryRepository;
import com.smartagri.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return toResponse(categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id)));
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, MultipartFile image) {
        if (categoryRepository.existsByCategoryNameIgnoreCase(request.getCategoryName())) {
            throw new DuplicateResourceException("Category already exists: " + request.getCategoryName());
        }
        String imageUrl = (image != null && !image.isEmpty())
                ? cloudinaryService.uploadImage(image, "categories") : null;
        Category category = Category.builder()
                .categoryName(request.getCategoryName())
                .emoji(request.getEmoji())
                .color(request.getColor())
                .image(imageUrl)
                .build();
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, MultipartFile image) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (image != null && !image.isEmpty()) {
            if (category.getImage() != null) cloudinaryService.deleteImage(category.getImage());
            category.setImage(cloudinaryService.uploadImage(image, "categories"));
        }
        category.setCategoryName(request.getCategoryName());
        category.setEmoji(request.getEmoji());
        category.setColor(request.getColor());
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (!productRepository.findByCategory_Id(id).isEmpty()) {
            throw new BadRequestException("Cannot delete category with existing products");
        }
        if (category.getImage() != null) cloudinaryService.deleteImage(category.getImage());
        categoryRepository.delete(category);
    }

    private CategoryResponse toResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .categoryName(c.getCategoryName())
                .image(c.getImage())
                .emoji(c.getEmoji())
                .color(c.getColor())
                .productCount(productRepository.findByCategory_Id(c.getId()).size())
                .build();
    }
}
