import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface SalesPoint {
  id: number;
  name: string;
  purchases_count: number;
  prepaid_cards_count: number;
  purchases_sum_total_amount: number;
  purchases_sum_total_cards: number;
}

interface Purchase {
  id: number;
  invoice_number: string;
  sales_point: {
    id: number;
    name: string;
  };
  admin: {
    id: number;
    name: string;
  };
  total_cards: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

interface RevenueByMonth {
  month: string;
  revenue: number;
  cards: number;
  purchases: number;
}

interface Analytics {
  total_revenue: number;
  pending_revenue: number;
  total_cards_sold: number;
  total_cards_redeemed: number;
  by_sales_point: SalesPoint[];
  recent_purchases: Purchase[];
  revenue_by_month: RevenueByMonth[];
}

interface Props {
  analytics: Analytics;
  period: string;
}

export default function Analytics({ analytics, period }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    router.get(
      route('sales-point-purchases.analytics'),
      { period: newPeriod },
      { preserveState: true }
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const redemptionRate =
    analytics.total_cards_sold > 0
      ? (analytics.total_cards_redeemed / analytics.total_cards_sold) * 100
      : 0;

  return (
    <DashboardLayout>
      <Head title="Revenue Analytics" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={route('sales-point-purchases.index')}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Revenue Analytics</h1>
              <p className="text-muted-foreground">
                Sales performance and revenue insights
              </p>
            </div>
          </div>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.total_revenue)}
              </div>
              <p className="text-xs text-muted-foreground">From paid purchases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.pending_revenue)}
              </div>
              <p className="text-xs text-muted-foreground">Outstanding payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cards Sold</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_cards_sold}</div>
              <p className="text-xs text-muted-foreground">Total inventory sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{redemptionRate.toFixed(1)}%</div>
              <Progress value={redemptionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Month */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
            <CardDescription>Monthly revenue and cards sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.revenue_by_month.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No revenue data available
                </p>
              ) : (
                analytics.revenue_by_month.map((item) => {
                  const maxRevenue = Math.max(
                    ...analytics.revenue_by_month.map((i) => i.revenue)
                  );
                  const percentage = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                  return (
                    <div key={item.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{formatMonth(item.month)}</span>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{item.cards} cards</span>
                          <span>{item.purchases} purchases</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sales Point Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Point Performance</CardTitle>
            <CardDescription>
              Revenue and activity by sales point
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sales Point</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Cards Sold</TableHead>
                    <TableHead>Cards Redeemed</TableHead>
                    <TableHead>Redemption Rate</TableHead>
                    <TableHead>Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.by_sales_point.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No sales point data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    analytics.by_sales_point.map((sp) => {
                      const spRedemptionRate =
                        sp.purchases_sum_total_cards > 0
                          ? (sp.prepaid_cards_count / sp.purchases_sum_total_cards) * 100
                          : 0;

                      return (
                        <TableRow key={sp.id}>
                          <TableCell className="font-medium">{sp.name}</TableCell>
                          <TableCell>{sp.purchases_count}</TableCell>
                          <TableCell>{sp.purchases_sum_total_cards || 0}</TableCell>
                          <TableCell>{sp.prepaid_cards_count || 0}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16">
                                <Progress value={spRedemptionRate} />
                              </div>
                              <span className="text-sm">
                                {spRedemptionRate.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(sp.purchases_sum_total_amount || 0)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>
              Latest {selectedPeriod} days of activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Sales Point</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.recent_purchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No recent purchases
                      </TableCell>
                    </TableRow>
                  ) : (
                    analytics.recent_purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-mono text-sm">
                          <Link
                            href={route('sales-point-purchases.show', purchase.id)}
                            className="text-blue-600 hover:underline"
                          >
                            {purchase.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>{purchase.sales_point.name}</TableCell>
                        <TableCell>{purchase.total_cards}</TableCell>
                        <TableCell>{formatCurrency(purchase.total_amount)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              purchase.payment_status === 'paid'
                                ? 'bg-green-50 text-green-700'
                                : purchase.payment_status === 'pending'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {purchase.payment_status.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(purchase.created_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
