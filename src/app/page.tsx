'use client'

import { Users } from '@/components/crud/Users'
import { Brokers } from '@/components/crud/Brokers'
import { Bots } from '@/components/crud/Bots'
import { Plans } from '@/components/crud/Plans'
import { BotPlans } from '@/components/crud/BotPlans'
import { Trades } from '@/components/crud/Trades'
import { Schedules } from '@/components/crud/Schedules'
import { useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <main className="min-h-screen p-4">
      <nav className="mb-8">
        <div className="border-b border-gray-200">
          <div className="flex -mb-px">
            {['users', 'brokers', 'bots', 'plans', 'bot-plans', 'trades', 'schedules'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`mr-1 py-2 px-4 text-sm font-medium ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {activeTab === 'users' && <Users />}
      {activeTab === 'brokers' && <Brokers />}
      {activeTab === 'bots' && <Bots />}
      {activeTab === 'plans' && <Plans />}
      {activeTab === 'bot-plans' && <BotPlans />}
      {activeTab === 'trades' && <Trades />}
      {activeTab === 'schedules' && <Schedules />}
    </main>
  )
} 