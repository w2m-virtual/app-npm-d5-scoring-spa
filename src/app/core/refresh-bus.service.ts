import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RefreshBus {
  private readonly subject = new Subject<void>();
  readonly refresh$ = this.subject.asObservable();

  trigger(): void {
    this.subject.next();
  }
}
