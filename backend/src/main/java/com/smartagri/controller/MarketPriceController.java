package com.smartagri.controller;

import com.smartagri.dto.request.MarketPriceRequest;
import com.smartagri.dto.response.*;
import com.smartagri.service.MarketPriceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/market-prices")
@RequiredArgsConstructor
@Tag(name = "Market Prices", description = "Live commodity market prices")
public class MarketPriceController {

    private final MarketPriceService marketPriceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MarketPriceResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(marketPriceService.getAllPrices()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MarketPriceResponse>> create(@Valid @RequestBody MarketPriceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Created", marketPriceService.createPrice(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MarketPriceResponse>> update(
            @PathVariable Long id, @Valid @RequestBody MarketPriceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Updated", marketPriceService.updatePrice(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        marketPriceService.deletePrice(id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", null));
    }
}
