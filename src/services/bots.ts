import { Bot, mockBots } from '@/models/bot';

export interface CreateBotDto {
  name: string;
  plan_id: string;
}

export interface UpdateBotDto {
  name?: string;
  plan_id?: string;
}

export const botsService = {
  /**
   * Get all bots for a user
   */
  getByUserId: async (userId: string): Promise<Bot[]> => {
    // In a real implementation, you would query the database
    return mockBots.filter(b => b.user_id === userId);
  },

  /**
   * Get a bot by ID
   */
  getById: async (id: string): Promise<Bot | null> => {
    // In a real implementation, you would query the database
    const bot = mockBots.find(b => b.id === id);
    return bot || null;
  },

  /**
   * Get a bot by token
   */
  getByToken: async (token: string): Promise<Bot | null> => {
    // In a real implementation, you would query the database
    const bot = mockBots.find(b => b.token === token);
    return bot || null;
  },

  /**
   * Create a new bot
   */
  create: async (data: CreateBotDto, userId: string): Promise<Bot> => {
    // In a real implementation, you would insert into the database
    
    // Generate a unique token
    const token = `bot_token_${Math.random().toString(36).substring(2, 15)}`;
    
    // Find the plan
    const plan = mockBots.find(b => b.plan_id === data.plan_id)?.plan;
    
    if (!plan) {
      throw new Error('Invalid plan ID');
    }
    
    const newBot: Bot = {
      id: Math.random().toString(36).substring(2, 9),
      name: data.name,
      token,
      user_id: userId,
      plan_id: data.plan_id,
      plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to mock data
    mockBots.push(newBot);
    
    return newBot;
  },

  /**
   * Update a bot
   */
  update: async (id: string, data: UpdateBotDto): Promise<Bot | null> => {
    // In a real implementation, you would update the database
    const index = mockBots.findIndex(b => b.id === id);
    if (index === -1) {
      return null;
    }
    
    // Update the bot
    mockBots[index] = {
      ...mockBots[index],
      ...(data.name && { name: data.name }),
      ...(data.plan_id && { 
        plan_id: data.plan_id,
        plan: mockBots.find(b => b.plan_id === data.plan_id)?.plan || mockBots[index].plan
      }),
      updated_at: new Date().toISOString()
    };
    
    return mockBots[index];
  },

  /**
   * Delete a bot
   */
  delete: async (id: string): Promise<boolean> => {
    // In a real implementation, you would delete from the database
    const index = mockBots.findIndex(b => b.id === id);
    if (index === -1) {
      return false;
    }
    
    // Remove from mock data
    mockBots.splice(index, 1);
    
    return true;
  },

  /**
   * Regenerate a bot's token
   */
  regenerateToken: async (id: string): Promise<Bot | null> => {
    // In a real implementation, you would update the database
    const index = mockBots.findIndex(b => b.id === id);
    if (index === -1) {
      return null;
    }
    
    // Generate a new token
    const token = `bot_token_${Math.random().toString(36).substring(2, 15)}`;
    
    // Update the bot
    mockBots[index] = {
      ...mockBots[index],
      token,
      updated_at: new Date().toISOString()
    };
    
    return mockBots[index];
  }
}; 