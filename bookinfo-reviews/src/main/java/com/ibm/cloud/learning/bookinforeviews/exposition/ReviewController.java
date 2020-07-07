package com.ibm.cloud.learning.bookinforeviews.exposition;

import com.ibm.cloud.learning.bookinforeviews.domain.Review;
import com.ibm.cloud.learning.bookinforeviews.domain.ReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.util.Objects.requireNonNull;
import static java.util.stream.Collectors.toList;

@RestController
@Transactional
public class ReviewController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ReviewController.class);

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = requireNonNull(reviewRepository);
    }

    @GetMapping("/reviews/{bookId}")
    public List<ReviewDto> getReviewsForBookId(@PathVariable String bookId) {
        requireNonNull(bookId);
        LOGGER.info("Processing get reviews request for bookId: {}", bookId);
        return reviewRepository.findAllByBookId(bookId)
                .stream()
                .map(ReviewDto::new)
                .collect(toList());
    }

    @PostMapping("/reviews")
    public ResponseEntity<Void> createReview(@RequestBody ReviewDto reviewDto) {
        LOGGER.info("Processing create review request for bookId: {}", reviewDto.bookId);
        Review review = new Review(reviewDto.bookId, reviewDto.reviewContent, reviewDto.reviewer);
        reviewRepository.save(review);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}
