package com.ibm.cloud.learning.bookinforatings.exposition;

import com.ibm.cloud.learning.bookinforatings.domain.Rating;

import java.time.format.DateTimeFormatter;

public class RatingDto {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public String bookId;
    public int rating;
    public String user;
    public String ratingDate;

    public RatingDto(Rating ratingEntity) {
        this.bookId = ratingEntity.getBookId();
        this.rating = ratingEntity.getRating();
        this.user = ratingEntity.getUser();
        this.ratingDate = ratingEntity.getRatingDate().format(FORMATTER);
    }

    public RatingDto() {}
}
