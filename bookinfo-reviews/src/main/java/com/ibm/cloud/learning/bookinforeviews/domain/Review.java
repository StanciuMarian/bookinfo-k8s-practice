package com.ibm.cloud.learning.bookinforeviews.domain;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
public class Review implements Serializable {
    @Id
    private String reviewId;

    @NotBlank
    @Size(min = 1, max = 50)
    private String bookId;

    @Size(max = 4000)
    private String reviewContent;

    @Size(min = 1, max = 50)
    private String reviewer;

    private LocalDateTime reviewDate;

    public Review(@NotBlank @Size(min = 1, max = 50) String bookId,
                  @Size(max = 4000) String reviewContent,
                  @Size(min = 1, max = 50) String reviewer) {
        this.reviewId = UUID.randomUUID().toString();
        this.bookId = bookId;
        this.reviewContent = reviewContent;
        this.reviewer = reviewer;
        this.reviewDate = LocalDateTime.now();
    }

    public String getBookId() {
        return bookId;
    }

    public String getReviewContent() {
        return reviewContent;
    }

    public String getReviewer() {
        return reviewer;
    }

    public LocalDateTime getReviewDate() {
        return reviewDate;
    }

    private Review() {}
}
