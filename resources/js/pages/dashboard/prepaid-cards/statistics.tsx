import { Card } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard/layout';
import { SharedData } from '@/types/global';
import { ReactNode } from 'react';

interface Props extends SharedData {
   statistics: CardStatistics;
   recentActivations: Array<{
      id: number;
      prepaidCard: {
         code: string;
         card_type: string;
         price: number;
         currency: string;
      };
      user: {
         name: string;
         email: string;
      };
      activated_at: string;
   }>;
   chartData: {
      statusDistribution: {
         labels: string[];
         values: number[];
      };
      typeDistribution: {
         single_course: number;
         bundle: number;
      };
      activationTrend: Array<{
         date: string;
         count: number;
      }>;
   };
}

const Statistics = ({ statistics, recentActivations, chartData, translate }: Props) => {
   const { dashboard } = translate;

   const getStatusColor = (index: number) => {
      const colors = ['#10b981', '#6b7280', '#ef4444', '#f97316'];
      return colors[index] || '#6b7280';
   };

   const calculatePercentage = (value: number, total: number) => {
      return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
   };

   return (
      <div>
         <h1 className="text-2xl font-bold mb-6">Prepaid Card Statistics</h1>

         {/* Key Metrics */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
               <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-2">Total Cards</span>
                  <span className="text-3xl font-bold">{statistics.total_cards}</span>
               </div>
            </Card>

            <Card className="p-6">
               <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-2">Active Cards</span>
                  <span className="text-3xl font-bold text-green-600">{statistics.active_cards}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                     {calculatePercentage(statistics.active_cards, statistics.total_cards)}% of total
                  </span>
               </div>
            </Card>

            <Card className="p-6">
               <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-2">Total Revenue</span>
                  <span className="text-3xl font-bold">${statistics.total_value.toLocaleString()}</span>
               </div>
            </Card>

            <Card className="p-6">
               <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-2">Redeemed Value</span>
                  <span className="text-3xl font-bold text-blue-600">
                     ${statistics.redeemed_value.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                     {calculatePercentage(statistics.redeemed_value, statistics.total_value)}% redeemed
                  </span>
               </div>
            </Card>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Status Distribution */}
            <Card className="p-6">
               <h2 className="text-lg font-semibold mb-4">Card Status Distribution</h2>
               <div className="space-y-4">
                  {chartData.statusDistribution.labels.map((label, index) => {
                     const value = chartData.statusDistribution.values[index];
                     const percentage = calculatePercentage(value, statistics.total_cards);
                     return (
                        <div key={label}>
                           <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium capitalize">{label}</span>
                              <span className="text-sm text-muted-foreground">
                                 {value} ({percentage}%)
                              </span>
                           </div>
                           <div className="w-full bg-muted rounded-full h-2">
                              <div
                                 className="h-2 rounded-full transition-all"
                                 style={{
                                    width: `${percentage}%`,
                                    backgroundColor: getStatusColor(index),
                                 }}
                              />
                           </div>
                        </div>
                     );
                  })}
               </div>
            </Card>

            {/* Card Type Distribution */}
            <Card className="p-6">
               <h2 className="text-lg font-semibold mb-4">Cards by Type</h2>
               <div className="space-y-4">
                  <div>
                     <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Single Course</span>
                        <span className="text-sm text-muted-foreground">
                           {chartData.typeDistribution.single_course} (
                           {calculatePercentage(
                              chartData.typeDistribution.single_course,
                              statistics.total_cards
                           )}
                           %)
                        </span>
                     </div>
                     <div className="w-full bg-muted rounded-full h-2">
                        <div
                           className="bg-blue-500 h-2 rounded-full transition-all"
                           style={{
                              width: `${calculatePercentage(
                                 chartData.typeDistribution.single_course,
                                 statistics.total_cards
                              )}%`,
                           }}
                        />
                     </div>
                  </div>

                  <div>
                     <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Bundle</span>
                        <span className="text-sm text-muted-foreground">
                           {chartData.typeDistribution.bundle} (
                           {calculatePercentage(chartData.typeDistribution.bundle, statistics.total_cards)}%)
                        </span>
                     </div>
                     <div className="w-full bg-muted rounded-full h-2">
                        <div
                           className="bg-purple-500 h-2 rounded-full transition-all"
                           style={{
                              width: `${calculatePercentage(
                                 chartData.typeDistribution.bundle,
                                 statistics.total_cards
                              )}%`,
                           }}
                        />
                     </div>
                  </div>
               </div>

               {/* Summary */}
               <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                           {chartData.typeDistribution.single_course}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Single Course Cards</div>
                     </div>
                     <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                           {chartData.typeDistribution.bundle}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Bundle Cards</div>
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         {/* Activation Trend */}
         <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Activation Trend (Last 7 Days)</h2>
            <div className="space-y-2">
               {chartData.activationTrend.map((item) => (
                  <div key={item.date} className="flex items-center gap-4">
                     <span className="text-sm w-24">{new Date(item.date).toLocaleDateString()}</span>
                     <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                        <div
                           className="bg-green-500 h-8 rounded-full transition-all flex items-center justify-end pr-2"
                           style={{
                              width: `${Math.max(
                                 (item.count / Math.max(...chartData.activationTrend.map((d) => d.count))) * 100,
                                 5
                              )}%`,
                           }}
                        >
                           <span className="text-xs font-semibold text-white">{item.count}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
               <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Recent Activations (Last 7 Days)</span>
                  <span className="text-2xl font-bold">{statistics.recent_activations}</span>
               </div>
            </div>
         </Card>

         {/* Recent Activations List */}
         <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Card Activations</h2>
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="border-b">
                        <th className="text-left p-3">Card Code</th>
                        <th className="text-left p-3">Type</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Value</th>
                        <th className="text-left p-3">Activated At</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recentActivations.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="text-center p-8 text-muted-foreground">
                              No recent activations
                           </td>
                        </tr>
                     ) : (
                        recentActivations.map((activation) => (
                           <tr key={activation.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                 <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {activation.prepaidCard.code}
                                 </code>
                              </td>
                              <td className="p-3">
                                 <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                       activation.prepaidCard.card_type === 'single_course'
                                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                                    }`}
                                 >
                                    {activation.prepaidCard.card_type === 'single_course' ? 'Single' : 'Bundle'}
                                 </span>
                              </td>
                              <td className="p-3">
                                 <div>
                                    <div className="font-medium">{activation.user.name}</div>
                                    <div className="text-xs text-muted-foreground">{activation.user.email}</div>
                                 </div>
                              </td>
                              <td className="p-3">
                                 <span className="font-medium">
                                    {activation.prepaidCard.price} {activation.prepaidCard.currency}
                                 </span>
                              </td>
                              <td className="p-3">
                                 <span className="text-sm">
                                    {new Date(activation.activated_at).toLocaleString()}
                                 </span>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </Card>
      </div>
   );
};

Statistics.layout = (page: ReactNode) => <DashboardLayout children={page} />;

export default Statistics;
