export interface Plan {
  id: number;
  name: string;
  description?: string;
  symbol: string;
  metadata?: any;
  reverse_position_threshold: number;
  cancel_trade_in_progress: boolean;
  only_action: string;
  broker_id: number;
  trailing_threshold_percentage: number;
  owner_id: number;
  active: boolean;
  trade_same_direction: boolean;
  created_at: string;
  updated_at?: string;
  owner_username?: string;
  expiration?: string;
}

export interface CreatePlanDTO {
  name: string;
  description?: string;
  symbol: string;
  active?: boolean;
  broker_id: number;
  metadata?: any;
  reverse_position_threshold: number;
  cancel_trade_in_progress: boolean;
  only_action: string;
  trailing_threshold_percentage: number;
  trade_same_direction?: boolean;
  expiration?: string;
}

export interface UpdatePlanDTO extends Partial<CreatePlanDTO> {} 