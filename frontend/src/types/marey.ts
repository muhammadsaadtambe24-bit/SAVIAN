// frontend/src/types/marey.ts

export interface Station {
  id?: number;
  code: string;
  name: string;
  distance_km: number;
  division?: string;
  zone?: string;
  kavach_status?: 'NOT_EQUIPPED' | 'IN_TRIALS' | 'COMMISSIONED';
  line_type?: string;
}

export type TrainType =
  | 'RAJDHANI'
  | 'VANDE_BHARAT'
  | 'EXPRESS'
  | 'MAIL'
  | 'PASSENGER'
  | 'FREIGHT';

export interface TrainPathPoint {
  station_code: string;
  arrival_minutes: number;
  departure_minutes: number;
}

export interface TrainSchedule {
  train_number: string;
  train_name: string;
  train_type: TrainType;
  direction?: 'UP' | 'DOWN';
  path: TrainPathPoint[];
}

export type BlockDepartment = 'P_WAY' | 'OHE' | 'S_AND_T';
export type BlockStatus = 'PROPOSED' | 'GRANTED' | 'SHADOW';

export interface MaintenanceBlock {
  block_id: string;
  demand_code: string;
  department: BlockDepartment;
  start_km: number;
  end_km: number;
  start_minutes: number;
  end_minutes: number;
  status: BlockStatus;
  is_shadow: boolean;
  has_clash: boolean;
  section_from?: string;
  section_to?: string;
  activity_description?: string;
  machinery_type?: string;
  shadow_parent_id?: string;
}

export interface TooltipEntityTrain {
  type: 'train';
  train: TrainSchedule;
  hoveredStation?: {
    station_code: string;
    arrival_minutes: number;
    departure_minutes: number;
    station_km?: number;
  };
}

export interface TooltipEntityBlock {
  type: 'block';
  block: MaintenanceBlock;
}

export type TooltipEntity = TooltipEntityTrain | TooltipEntityBlock;
