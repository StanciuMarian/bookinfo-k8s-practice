import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { BookDto } from '../dto/BookDto';

@Injectable({
  providedIn: 'root'
})
export class DetailsService {

  constructor(private http: HttpClient) { }

  getAllBooks() : Observable <BookDto[]>{
    return this.http.get<BookDto[]> (`${environment.DETAILS_APP_ENDPOINT}/books`, {})
    .pipe(map(response => response.map(book => Object.assign(new BookDto(), book))));
  }

  createBook(bookDto : BookDto) {
    return this.http.post<void> (`${environment.DETAILS_APP_ENDPOINT}/books`, bookDto);
  }

  getBook(bookId : string) : Observable <BookDto[]>{
    return this.http.get<BookDto[]> (`${environment.DETAILS_APP_ENDPOINT}/books/${bookId}`, {})
    .pipe(map(response => Object.assign(new BookDto(), response)));
  }
}
