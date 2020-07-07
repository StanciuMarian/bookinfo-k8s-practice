import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ReviewDto } from '../dto/ReviewDto';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  constructor(private http: HttpClient) { }

  getReviewsForBookId (bookId : String) : Observable <ReviewDto[]>{
    return this.http.get<ReviewDto[]> (`${environment.REVIEWS_APP_ENDPOINT}/reviews/${bookId}`, {})
    .pipe(map(response => response.map(review => Object.assign(new ReviewDto(), review))));
  }

  createReview(reviewDto : ReviewDto) : Observable<void> {
    return this.http.post<void> (`${environment.REVIEWS_APP_ENDPOINT}/reviews`, reviewDto);
  }
}
