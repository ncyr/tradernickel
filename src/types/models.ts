export interface User {
  id: number;
  external_id?: string;
  username: string;
  password: string;
  name: string;
  address: any; // jsonb
  active: boolean;
}

export interface Broker {
  id: number;
  name: string;
  active: boolean;
  metadata: any; // jsonb
  demo_url: string;
  prod_url: string;
}

export interface Bot {
  id: number;
  name: string;
  description: string;
  active: boolean;
  metadata: any; // jsonb
  region: string;
  provider: string;
  uuid: string;
  owner_id: number;
  broker_id: number;
  copy_active: boolean;
}

export interface Plan {
  id: number;
  created_at: Date;
  name: string;
  active: boolean;
  metadata: any; // jsonb
  reverse_position_threshold: number;
  cancel_trade_in_progress: boolean;
  only_action: string;
  expiration: Date;
  broker_id: number;
  trailing_threshold_percentage: number;
  symbol: string;
}

export interface BotPlan {
  id: number;
  created_at: Date;
  bot_id: number;
  plan_id: number;
  metadata: any; // jsonb
}

export interface PlanBroker {
  id: number;
  created_at: Date;
  broker_id: number;
  plan_id: number;
  metadata: any; // jsonb
}

export interface Trade {
  id: number;
  created_at: Date;
  bot_plan_id: number;
  ext_position_id: string;
  price: number;
  stop_loss: number;
  take_profit: number;
  time_to_complete: number;
  run_end: Date;
  metadata: any; // jsonb
  route_meta: any; // jsonb
}

export interface Schedule {
  id: number;
  created_at: Date;
  start_at: Date;
  end_at: Date;
  weekday: number;
  bot_plan_id: number;
} 