import { Component } from '@angular/core';
import { DetailsService } from './services/details.service';
import { BookDto } from './dto/BookDto';
import { ReviewDto } from './dto/ReviewDto';
import { RatingDto } from './dto/RatingDto';
import { RatingsServiceService as RatingsService } from './services/ratings.service';
import { ReviewsService } from './services/reviews.service';
import { RecommendationsService } from './services/recommendations.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {

  books: BookDto[] = [];
  reviews: ReviewDto[] = [];
  ratings: RatingDto[] = [];
  selectedBook: BookDto;
  review = '';
  rating = '5';
  showInitButton = false;
  recommendations: string[] = [];
  selectedGenre = 'all';

  constructor(private detailsService: DetailsService, 
    private ratingsService: RatingsService, 
    private reviewsService: ReviewsService, 
    private recommendationsService: RecommendationsService) {}

  ngOnInit() {
    this.getBooks();
  }

  getBooks() {
    this.detailsService.getAllBooks().subscribe(books => {
      if(books.length === 0) {
        this.showInitButton = true;
      }
      this.books = books;
    });
  }

  addReview() {
    this.reviewsService.createReview({
      bookId: this.selectedBook._id,
      reviewer: 'Marian',
      reviewContent: this.review, 
      reviewDate: '20/02/2020'
    }).subscribe(() => {
      this.getReviews();
      this.review = '';
    });
  }

  addRating() {
    this.ratingsService.createRating({
      bookId: this.selectedBook._id,
      user: 'Marian',
      rating: this.rating, 
      ratingDate: '20/02/2020'
    }).subscribe(() => {
      this.getRatings();
      this.rating = '5';
    });
  }

  selectBook(book: BookDto) {
    this.selectedBook = book;
    this.getReviews();
    this.getRatings();
  }

  getRecommendations() {
    this.recommendationsService.getRecommendations(this.selectedGenre).subscribe(rec => this.recommendations = rec);
  }

  getReviews() {
    this.reviewsService.getReviewsForBookId(this.selectedBook._id).subscribe(reviews => this.reviews = reviews);
  } 

  getRatings() {
    this.ratingsService.getRatingsForBookId(this.selectedBook._id).subscribe(ratings => this.ratings = ratings);
  }

  initDatabase() {
    this.initScript();
  }

  initScript() {
    const createBookRequests = this.initBooks.map(book => this.detailsService.createBook(book))
    forkJoin(createBookRequests).subscribe(() => {
      this.detailsService.getAllBooks().subscribe(books => {
        this.books = books;
        for(let book of books) {
          this.createRatingsForBook(book);
          this.createReviewsForBook(book);
        }
      });
    })
  }

  createReviewsForBook(book: BookDto) {
    this.initReviews.filter(review => review.ISBN === book.ISBN)
                    .map(review => this.reviewsService.createReview({bookId: book._id, ...review.review}))
                    .forEach(request => request.subscribe());
  }

  createRatingsForBook(book: BookDto) {
    this.initRatings.filter(rating => rating.ISBN === book.ISBN)
                    .map(rating => this.ratingsService.createRating({bookId: book._id, ...rating.rating}))
                    .forEach(rating => rating.subscribe());
  }

  initBooks = [
    {name: 'The C++ Programming Language', author: 'Bjarne Stroustrup', publisher: 'Primer Plus', ISBN: '1234'},
    {name: 'The C Programming Language', author: 'Kernighan an Ritchie', publisher: 'Editura', ISBN: '1235'},
    {name: 'EFFECTIVE JAVA', author: 'Joshua Bloch', publisher: 'Editura', ISBN: '1236'},
    {name: 'HEAD FIRST JAVA', author: 'Kathy Sierra, Bert Bates', publisher: 'Editura', ISBN: '1237'},
    {name: 'JAVA CONCURRENCY IN PRACTICE', author: 'Brian Goetz', publisher: 'Editura', ISBN: '1238'},
    {name: 'THE PRAGMATIC PROGRAMMER', author: 'Andrew Hunt, David Thomas', publisher: 'Editura', ISBN: '1239'},
    {name: 'CLEAN CODE', author: 'Robert C. Martin', publisher: 'Editura', ISBN: '1240'},
    {name: ' Mythical Man Month', author: 'Fred Brooks', publisher: 'Editura', ISBN: '1241'},
    {name: 'Working Effectively with Legacy Code', author: 'Michael Feathers', publisher: 'Editura', ISBN: '1242'},
    {name: 'Patterns of Enterprise Application Architecture', author: 'Martin Fowler', publisher: 'Martin Fowler', ISBN: '1243'},
  ];
  
  initReviews = [
    { ISBN: '1243', review: {reviewer: 'Marian', reviewContent: 'This book will help you avoid common enterprise application failures by illuminating lessons that experienced object developers have learned.', reviewDate: '01/02/2019'}},
    { ISBN: '1243', review: {reviewer: 'Marian', reviewContent: 'It will guide you through the process of analyzing a problem statement, formulating goals, outlining the solution, finishing your program, and finally testing it. The text is very engaging and will help you grasp the basics of program design.', reviewDate: '01/02/2019'}},
    { ISBN: '1242', review: {reviewer: 'Marian', reviewContent: 'It lays out the most common threats you’ll see and how you can best defend against them. Don’t wait until it’s too late, craft secure code from the start.', reviewDate: '01/02/2019'}},
    { ISBN: '1242', review: {reviewer: 'Marian', reviewContent: 'Security should be a core focus as you’re writing new programs and apps. This book offers developers a clear guide on best secure coding practices.', reviewDate: '01/02/2019'}},
    { ISBN: '1241', review: {reviewer: 'Marian', reviewContent: 'Currently, on its 4th edition, it’s an indispensable source of wisdom for programmers of all levels looking to grow their knowledge about algorithms.', reviewDate: '01/02/2019'}},
    { ISBN: '1240', review: {reviewer: 'Marian', reviewContent: 'This classic book is a great primer on algorithms and data structures. It’s also a short read, so it isn’t filled with endless theorizing but is a practical guide you can reference again and again.', reviewDate: '01/02/2019'}},
    { ISBN: '1240', review: {reviewer: 'Marian', reviewContent: 'The first edition of this book has been widely used in university courses, while later editions of this book have continued to update learning algorithms in the modern day.', reviewDate: '01/02/2019'}},
    { ISBN: '1240', review: {reviewer: 'Marian', reviewContent: 'The real-world code examples will help bring the principles you learn to life and show you how to implement patterns in the simplest manner possible.est', reviewDate: '01/02/2019'}},
    { ISBN: '1239', review: {reviewer: 'Marian', reviewContent: 'A solid guide to growing your career as a software developer.', reviewDate: '01/02/2019'}},
    { ISBN: '1239', review: {reviewer: 'Marian', reviewContent: 'This book will help you better understand your legacy code and how to get the most from it, so it’s not a drain on money and time.', reviewDate: '01/02/2019'}},
    { ISBN: '1238', review: {reviewer: 'Marian', reviewContent: 'This book will help you understand the tangible effects of the code you’re writing on the actual CPU. It’s a fascinating read in its entirety.', reviewDate: '01/02/2019'}},
    { ISBN: '1237', review: {reviewer: 'Marian', reviewContent: 'If you’re looking for ways to increase your competency as a leader, then this is a must read.', reviewDate: '01/02/2019'}},
    { ISBN: '1236', review: {reviewer: 'Marian', reviewContent: 'This book is all practical wisdom and zero fluff, follow this book and you’ll become a better developer.', reviewDate: '01/02/2019'}},
    { ISBN: '1235', review: {reviewer: 'Marian', reviewContent: 'Mike Cohn’s book gives you a philosophy, along with guidelines, tools, and principles for excelling in planning and scheduling for uncertain projects.st', reviewDate: '01/02/2019'}},
    { ISBN: '1235', review: {reviewer: 'Marian', reviewContent: 'Scrum brings its own unique set of challenges and this book seeks to remedy them in the most practical way possible.', reviewDate: '01/02/2019'}},
    { ISBN: '1235', review: {reviewer: 'Marian', reviewContent: 'A solid guide to growing your career as a software developer.', reviewDate: '01/02/2019'}},
    { ISBN: '1234', review: {reviewer: 'Marian', reviewContent: 'If you’re looking for ways to increase your competency as a leader, then this is a must read.', reviewDate: '01/02/2019'}},
  ]
  
  initRatings = [
    { ISBN: '1243', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1243', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1242', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1242', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1241', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1240', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1240', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1240', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1239', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1239', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1238', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1237', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1236', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1235', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1235', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1235', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
    { ISBN: '1234', rating: { user: 'Marian', rating: '5', ratingDate: '01/02/2019' } },
  ]
}



