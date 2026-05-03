import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, merge, startWith, switchMap } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScoringApiService } from '../../core/api/scoring-api.service';
import { SupplierScore } from '../../core/models/supplier-score';
import { RefreshBus } from '../../core/refresh-bus.service';

interface SupplierRow extends SupplierScore {
  rejectRatePct: number;
}

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './suppliers-list.component.html',
  styleUrl: './suppliers-list.component.scss',
})
export class SuppliersListComponent {
  private readonly api = inject(ScoringApiService);
  private readonly bus = inject(RefreshBus);
  private readonly snackbar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly rows = signal<SupplierRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly expanded = signal<string | null>(null);
  protected readonly columns = [
    'supplierId',
    'totalAttempts',
    'confirmed',
    'rejected',
    'rejectRate',
    'score',
    'lastUpdatedAt',
  ];

  protected readonly empty = computed(() => !this.loading() && this.rows().length === 0);

  constructor() {
    merge(interval(15000), this.bus.refresh$)
      .pipe(
        startWith(0),
        switchMap(() => this.api.listSuppliers()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (list) => {
          const enriched = (list ?? []).map((s) => ({
            ...s,
            rejectRatePct:
              s.totalAttempts > 0 ? Math.round((s.rejected / s.totalAttempts) * 1000) / 10 : 0,
          }));
          this.rows.set(enriched);
          this.loading.set(false);
        },
        error: (err) => {
          this.snackbar.open(`Error cargando scoring: ${err?.message ?? err}`, 'Cerrar', {
            duration: 5000,
          });
          this.loading.set(false);
        },
      });
  }

  protected toggle(row: SupplierRow): void {
    this.expanded.set(this.expanded() === row.supplierId ? null : row.supplierId);
  }

  protected isExpanded(row: SupplierRow): boolean {
    return this.expanded() === row.supplierId;
  }

  protected copyId(id: string, ev: MouseEvent): void {
    ev.stopPropagation();
    navigator.clipboard?.writeText(id).then(
      () => this.snackbar.open('Supplier ID copiado', 'OK', { duration: 1500 }),
      () => this.snackbar.open('No se pudo copiar', 'Cerrar', { duration: 2000 }),
    );
  }

  protected truncate(id: string): string {
    if (!id) return '';
    return id.length <= 12 ? id : `${id.slice(0, 8)}…${id.slice(-4)}`;
  }

  protected scoreLevel(score: number): 'good' | 'mid' | 'bad' {
    if (score >= 80) return 'good';
    if (score >= 50) return 'mid';
    return 'bad';
  }

  protected rejectLevel(pct: number): 'good' | 'mid' | 'bad' {
    if (pct < 5) return 'good';
    if (pct <= 20) return 'mid';
    return 'bad';
  }

  protected relativeTime(iso: string): string {
    if (!iso) return '—';
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return iso;
    const diffMs = Date.now() - then;
    const sec = Math.round(diffMs / 1000);
    if (sec < 5) return 'justo ahora';
    if (sec < 60) return `hace ${sec}s`;
    const min = Math.round(sec / 60);
    if (min < 60) return `hace ${min} min`;
    const h = Math.round(min / 60);
    if (h < 24) return `hace ${h} h`;
    const d = Math.round(h / 24);
    return `hace ${d} d`;
  }

  protected pct(part: number, total: number): number {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  }
}
