import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Tracks how many HTTP requests are currently in flight.
// The loading spinner shows whenever count > 0. Using a counter (not a
// boolean) means overlapping requests don't cause the spinner to
// disappear too early.
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private requestCount = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) this.loadingSubject.next(false);
  }
}
