import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, merge, startWith, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScoringApiService } from '../../core/api/scoring-api.service';
import { SupplierScore } from '../../core/models/supplier-score';
import { RefreshBus } from '../../core/refresh-bus.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly api = inject(ScoringApiService);
  private readonly bus = inject(RefreshBus);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly suppliers = signal<SupplierScore[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly totalSuppliers = computed(() => this.suppliers().length);

  protected readonly totalAttempts = computed(() =>
    this.suppliers().reduce((sum, s) => sum + (s.totalAttempts ?? 0), 0),
  );

  protected readonly totalConfirmed = computed(() =>
    this.suppliers().reduce((sum, s) => sum + (s.confirmed ?? 0), 0),
  );

  protected readonly confirmRatePct = computed(() => {
    const t = this.totalAttempts();
    if (t === 0) return 0;
    return Math.round((this.totalConfirmed() / t) * 1000) / 10;
  });

  protected readonly avgScore = computed(() => {
    const list = this.suppliers();
    if (list.length === 0) return 0;
    const sum = list.reduce((s, x) => s + (x.score ?? 0), 0);
    return Math.round((sum / list.length) * 10) / 10;
  });

  protected readonly empty = computed(
    () => !this.loading() && this.suppliers().length === 0 && !this.error(),
  );

  constructor() {
    merge(interval(15000), this.bus.refresh$)
      .pipe(
        startWith(0),
        switchMap(() => this.api.listSuppliers()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => {
          this.suppliers.set(rows ?? []);
          this.loading.set(false);
          this.error.set(null);
        },
        error: (err) => {
          this.error.set(err?.message ?? 'Error cargando datos');
          this.loading.set(false);
        },
      });
  }
}
