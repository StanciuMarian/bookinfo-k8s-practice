package com.ibm.cloud.learning.bookinforatings.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, String> {
    List<Rating> findAllByBookId(String bookId);
}
