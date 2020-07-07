package com.ibm.cloud.learning.bookinforeviews.exposition;

import com.ibm.cloud.learning.bookinforeviews.domain.Review;

import java.time.format.DateTimeFormatter;

public class ReviewDto {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public String bookId;
    public String reviewContent;
    public String reviewer;
    public String reviewDate;

    public ReviewDto(Review review) {
        this.bookId = review.getBookId();
        this.reviewContent = review.getReviewContent();
        this.reviewDate = review.getReviewDate().format(FORMATTER);
        this.reviewer = review.getReviewer();
    }

    public ReviewDto() {}

}
