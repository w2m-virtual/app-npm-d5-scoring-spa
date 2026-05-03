import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupplierScore } from '../models/supplier-score';

@Injectable({ providedIn: 'root' })
export class ScoringApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  listSuppliers(): Observable<SupplierScore[]> {
    return this.http.get<SupplierScore[]>(`${this.base}/api/scoring/suppliers`);
  }

  getSupplier(supplierId: string): Observable<SupplierScore> {
    return this.http.get<SupplierScore>(`${this.base}/api/scoring/suppliers/${supplierId}`);
  }
}
