package com.example.AgriConnect.service;

import com.example.AgriConnect.dto.request.SchemeRequest;
import com.example.AgriConnect.dto.response.SchemeResponse;
import com.example.AgriConnect.entity.GovernmentScheme;
import com.example.AgriConnect.exception.ResourceNotFoundException;
import com.example.AgriConnect.repository.GovernmentSchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GovernmentSchemeService {

    private final GovernmentSchemeRepository repository;

    public SchemeResponse addScheme(SchemeRequest request) {

        GovernmentScheme scheme = GovernmentScheme.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .state(request.getState())
                .category(request.getCategory())
                .applyLink(request.getApplyLink())
                .active(true)
                .build();

        GovernmentScheme saved = repository.save(scheme);

        return mapToResponse(saved);
    }

    public List<SchemeResponse> getAllSchemes() {
        return repository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<SchemeResponse> getByState(String state) {
        return repository.findByStateIgnoreCase(state)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void deactivate(Long id) {

        GovernmentScheme scheme = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Scheme not found"));

        scheme.setActive(false);
        repository.save(scheme);
    }

    private SchemeResponse mapToResponse(GovernmentScheme s) {

        return SchemeResponse.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .state(s.getState())
                .category(s.getCategory())
                .applyLink(s.getApplyLink())
                .active(s.isActive())
                .build();
    }
}