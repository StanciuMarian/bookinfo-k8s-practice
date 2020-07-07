package com.ibm.cloud.learning.bookinforatings.exposition;

import com.ibm.cloud.learning.bookinforatings.domain.Rating;
import com.ibm.cloud.learning.bookinforatings.domain.RatingRepository;
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
public class RatingController {
    private static final Logger LOGGER = LoggerFactory.getLogger(RatingController.class);

    private final RatingRepository ratingRepository;

    public RatingController(RatingRepository ratingRepository) {
        this.ratingRepository = requireNonNull(ratingRepository);
    }

    @GetMapping("/ratings/{bookId}")
    public List<RatingDto> getRatingsForBookId(@PathVariable String bookId) {
        requireNonNull(bookId);
        LOGGER.info("Processing get ratings request for bookId: {}", bookId);
        return ratingRepository.findAllByBookId(bookId)
                .stream()
                .map(RatingDto::new)
                .collect(toList());
    }

    @GetMapping("/ratings-avg/{bookId}")
    public double getRatingsAverageForBookId(@PathVariable String bookId) {
        requireNonNull(bookId);
        LOGGER.info("Processing get ratings request for bookId: {}", bookId);
        List<Rating> ratings = ratingRepository.findAllByBookId(bookId);
        return ratings.stream().map(Rating::getRating).mapToInt(i -> i).average().orElse(0);
    }

    @PostMapping("/ratings")
    public ResponseEntity<Void> createRating(@RequestBody RatingDto ratingDto) {
        LOGGER.info("Processing create rating request for bookId: {}", ratingDto.bookId);
        Rating rating = new Rating(ratingDto.bookId, ratingDto.user, ratingDto.rating);
        ratingRepository.save(rating);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}
