// station.ts
export interface Station {
  id: number;
  code: string;
  name: string;
  distance_km: number;
  division: string;
  zone: string;
  kavach_status: 'NOT_EQUIPPED' | 'IN_TRIALS' | 'COMMISSIONED';
}
