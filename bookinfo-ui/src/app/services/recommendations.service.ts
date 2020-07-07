import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecommendationsService {

  constructor(private http: HttpClient) { }

  getRecommendations(genre) : Observable <string[]>{
    return this.http.get<string[]> (`${environment.RECOMMENDATIONS_APP_ENDPOINT}/${genre}`, {})
  }
}
