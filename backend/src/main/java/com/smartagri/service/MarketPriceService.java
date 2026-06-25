package com.smartagri.service;

import com.smartagri.dto.request.MarketPriceRequest;
import com.smartagri.dto.response.MarketPriceResponse;
import com.smartagri.entity.MarketPrice;
import com.smartagri.exception.ResourceNotFoundException;
import com.smartagri.repository.MarketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketPriceService {

    private final MarketPriceRepository marketPriceRepository;

    @Transactional(readOnly = true)
    public List<MarketPriceResponse> getAllPrices() {
        return marketPriceRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public MarketPriceResponse createPrice(MarketPriceRequest request) {
        MarketPrice mp = MarketPrice.builder()
                .commodityName(request.getCommodityName())
                .emoji(request.getEmoji())
                .price(request.getPrice())
                .change(request.getChange())
                .unit(request.getUnit())
                .build();
        return toResponse(marketPriceRepository.save(mp));
    }

    @Transactional
    public MarketPriceResponse updatePrice(Long id, MarketPriceRequest request) {
        MarketPrice mp = marketPriceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MarketPrice", id));
        mp.setCommodityName(request.getCommodityName());
        mp.setEmoji(request.getEmoji());
        mp.setPrice(request.getPrice());
        mp.setChange(request.getChange());
        mp.setUnit(request.getUnit());
        return toResponse(marketPriceRepository.save(mp));
    }

    @Transactional
    public void deletePrice(Long id) {
        marketPriceRepository.deleteById(id);
    }

    private MarketPriceResponse toResponse(MarketPrice mp) {
        return MarketPriceResponse.builder()
                .id(mp.getId())
                .commodityName(mp.getCommodityName())
                .emoji(mp.getEmoji())
                .price(mp.getPrice())
                .change(mp.getChange())
                .unit(mp.getUnit())
                .updatedAt(mp.getUpdatedAt())
                .build();
    }
}
