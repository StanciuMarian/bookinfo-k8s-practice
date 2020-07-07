import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { RatingDto } from '../dto/RatingDto';

@Injectable({
  providedIn: 'root'
})
export class RatingsServiceService {

  constructor(private http : HttpClient ) { }

  getRatingsForBookId (bookId : String) : Observable <RatingDto[]>{
    return this.http.get<RatingDto[]> (`${environment.RATINGS_APP_ENDPOINT}/ratings/${bookId}`, {})
    .pipe(map(response => response.map(rating => Object.assign(new RatingDto(), rating))));
  }

  getRatingsAverageForBookId(bookId : String) : Observable <RatingDto[]>{
    return this.http.get<RatingDto[]> (`${environment.RATINGS_APP_ENDPOINT}/ratings-avg/${bookId}`, {})
    .pipe(map(response => Object.assign(new RatingDto(), response)));
  }

  createRating(ratingDto : RatingDto) : Observable<void> {
    return this.http.post<void> (`${environment.RATINGS_APP_ENDPOINT}/ratings`, ratingDto);
  }
}
