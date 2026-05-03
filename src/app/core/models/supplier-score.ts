export interface SupplierScore {
  supplierId: string;
  totalAttempts: number;
  confirmed: number;
  rejected: number;
  score: number;
  lastUpdatedAt: string;
}
