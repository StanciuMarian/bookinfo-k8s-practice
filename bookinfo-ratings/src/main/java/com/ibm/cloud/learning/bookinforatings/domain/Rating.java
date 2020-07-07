package com.ibm.cloud.learning.bookinforatings.domain;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ratings")
public class Rating implements Serializable {

    @Id
    private String ratingId;

    @NotBlank
    @Size(min = 1, max = 50)
    private String bookId;

    private int rating;

    @Size(min = 1, max = 50)
    @Column(name = "USER_RATING")
    private String user;

    private LocalDateTime ratingDate;

    public Rating(@NotBlank @Size(min = 1, max = 50) String bookId,
                  @Size(min = 1, max = 50) String user,
                  int rating) {
        this.ratingId = UUID.randomUUID().toString();
        this.bookId = bookId;
        this.rating = rating;
        this.user = user;
        this.ratingDate = LocalDateTime.now();
    }

    public String getBookId() {
        return bookId;
    }

    public int getRating() {
        return rating;
    }

    public String getUser() {
        return user;
    }

    public LocalDateTime getRatingDate() {
        return ratingDate;
    }

    private Rating() {}
}
