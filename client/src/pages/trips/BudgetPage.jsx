import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieIcon, 
  ArrowRight,
  Hotel,
  Utensils,
  Car,
  Ticket,
  AlertCircle
} from 'lucide-react';

import PageHeader from '../../components/PageHeader';
import Card from '../../components/Card';
import ProgressBar from '../../components/ProgressBar';
import Button from '../../components/Button';
import useDownloadStore from '../../store/download.store.js';

export default function BudgetPage() {
  const [budgetData, setBudgetData] = useState(null);
  const startDownload = useDownloadStore(s => s.startDownload);
  useEffect(() => {
    setBudgetData({
      total: 3450.00,
      perDay: 287.50,
      breakdown: {
        accommodation: 1800.00,
        food: 750.00,
        transport: 500.00,
        activities: 400.00
      },
      stops: [
        { cityName: 'Tokyo', days: 5, total: 1500, costIndex: 'high' },
        { cityName: 'Kyoto', days: 3, total: 900, costIndex: 'medium' },
        { cityName: 'Osaka', days: 4, total: 1050, costIndex: 'medium' }
      ]
    });
  }, []);

  if (!budgetData) return null;

  const stats = [
    { label: 'Total Estimate', value: `$${budgetData.total}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg / Day', value: `$${budgetData.perDay}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Destinations', value: budgetData.stops.length, icon: ArrowRight, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const breakdownItems = [
    { label: 'Accommodation', amount: budgetData.breakdown.accommodation, icon: Hotel, color: 'bg-indigo-500' },
    { label: 'Food & Dining', amount: budgetData.breakdown.food, icon: Utensils, color: 'bg-orange-500' },
    { label: 'Transportation', amount: budgetData.breakdown.transport, icon: Car, color: 'bg-blue-500' },
    { label: 'Activities', amount: budgetData.breakdown.activities, icon: Ticket, color: 'bg-pink-500' },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <PageHeader 
        title="Financial Planning" 
        subtitle="Automatic budget estimations based on your destinations and activities."
      />

      {/* Top Stats */}
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map(stat => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-(--app-color-text-muted)">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Cost Breakdown */}
        <div className="space-y-6">
          <Card className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="text-xl font-bold text-(--app-color-text)">Cost Breakdown</h3>
              <PieIcon className="text-slate-300" size={24} />
            </div>

            <div className="space-y-8">
              {breakdownItems.map(item => {
                const percentage = (item.amount / budgetData.total) * 100;
                return (
                  <div key={item.label} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${item.color}`} />
                        <span className="text-sm font-bold text-(--app-color-text)">{item.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-(--app-color-text)">${item.amount.toLocaleString()}</span>
                        <span className="ml-2 text-xs text-(--app-color-text-muted)">({Math.round(percentage)}%)</span>
                      </div>
                    </div>
                    <ProgressBar value={percentage} className={`h-2 rounded-full ${item.color.replace('bg-', 'bg-opacity-20 ')}`} />
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl bg-amber-50 p-6">
              <div className="flex gap-4">
                <AlertCircle className="shrink-0 text-amber-600" size={20} />
                <div>
                  <p className="text-sm font-bold text-amber-900">Budget Tip</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800/80">
                    Your accommodation costs are {Math.round((budgetData.breakdown.accommodation / budgetData.total) * 100)}% of your total budget. 
                    Consider exploring "Free" activities to balance your daily spend.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stop Breakdown */}
        <div className="space-y-6">
          <Card className="p-8">
            <h3 className="mb-6 text-xl font-bold text-(--app-color-text)">Spend by City</h3>
            <div className="space-y-4">
              {budgetData.stops.map(stop => (
                <div key={stop.cityName} className="flex items-center justify-between rounded-2xl border border-(--app-color-border) p-4 transition-all hover:border-(--app-color-primary) hover:bg-(--app-color-surface-elevated)">
                  <div>
                    <p className="text-sm font-black text-(--app-color-text)">{stop.cityName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-(--app-color-text-muted)">{stop.days} Days • {stop.costIndex} cost</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-(--app-color-primary)">${stop.total.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-emerald-600">Estimate</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-(--app-color-primary) to-(--app-color-accent) p-8 text-white">
            <h4 className="mb-2 text-lg font-bold">Ready to travel?</h4>
            <p className="mb-6 text-sm text-white/80">Export this budget as a CSV or PDF for your travel group.</p>
            <Button 
              variant="tertiary" 
              className="w-full bg-white/10 text-white hover:bg-white/20"
              onClick={() => startDownload('Full Budget Report')}
            >
              Download Report
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
