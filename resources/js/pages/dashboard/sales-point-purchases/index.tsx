import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Clock,
  CreditCard,
  Eye,
  TrendingUp,
  Download,
  MoreHorizontal,
} from 'lucide-react';

interface SalesPoint {
  id: number;
  name: string;
  phone: string;
  email: string;
}

interface Admin {
  id: number;
  name: string;
}

interface Purchase {
  id: number;
  invoice_number: string;
  sales_point: SalesPoint;
  admin: Admin;
  total_cards: number;
  total_amount: number;
  currency: string;
  payment_status: 'paid' | 'pending' | 'partial' | 'refunded';
  payment_method: string | null;
  payment_date: string | null;
  created_at: string;
}

interface Stats {
  total_purchases: number;
  total_revenue: number;
  pending_payments: number;
  total_cards_sold: number;
}

interface Props {
  purchases: {
    data: Purchase[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: Stats;
  salesPoints: SalesPoint[];
  filters: {
    search: string | null;
    sales_point_id: number | null;
    payment_status: string | null;
  };
}

export default function Index({ purchases, stats, salesPoints, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [salesPointId, setSalesPointId] = useState<string>(
    filters.sales_point_id?.toString() || 'all'
  );
  const [paymentStatus, setPaymentStatus] = useState<string>(
    filters.payment_status || 'all'
  );

  const handleFilter = () => {
    router.get(
      route('sales-point-purchases.index'),
      {
        search: search || undefined,
        sales_point_id: salesPointId !== 'all' ? salesPointId : undefined,
        payment_status: paymentStatus !== 'all' ? paymentStatus : undefined,
      },
      { preserveState: true }
    );
  };

  const handleReset = () => {
    setSearch('');
    setSalesPointId('all');
    setPaymentStatus('all');
    router.get(route('sales-point-purchases.index'));
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'partial':
        return 'bg-blue-500/10 text-blue-500';
      case 'refunded':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <Head title="Sales Point Purchases" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Point Purchases</h1>
            <p className="text-muted-foreground">
              Manage card sales to sales points and track revenue
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={route('sales-point-purchases.analytics')}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
            <Button asChild>
              <Link href={route('sales-point-purchases.create')}>
                <Plus className="mr-2 h-4 w-4" />
                Sell Cards
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_purchases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.total_revenue, 'USD')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.pending_payments, 'USD')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cards Sold</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_cards_sold}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Search and filter purchases by sales point and payment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search by invoice number or sales point..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
              </div>
              <Select value={salesPointId} onValueChange={setSalesPointId}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Sales Points" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales Points</SelectItem>
                  {salesPoints.map((sp) => (
                    <SelectItem key={sp.id} value={sp.id.toString()}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={handleFilter}>
                  <Search className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>
              {purchases.total} total purchases found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Sales Point</TableHead>
                    <TableHead>Cards</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No purchases found
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchases.data.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">
                          {purchase.invoice_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {purchase.sales_point.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {purchase.sales_point.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{purchase.total_cards}</TableCell>
                        <TableCell>
                          {formatCurrency(purchase.total_amount, purchase.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPaymentStatusColor(purchase.payment_status)}
                          >
                            {purchase.payment_status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {purchase.payment_method || '-'}
                        </TableCell>
                        <TableCell>{formatDate(purchase.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={route('sales-point-purchases.show', purchase.id)}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <a href={route('sales-point-purchases.invoice.download', purchase.id)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Invoice
                                  </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a href={route('sales-point-purchases.invoice.view', purchase.id)} target="_blank">
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Invoice
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {purchases.last_page > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(purchases.current_page - 1) * purchases.per_page + 1} to{' '}
                  {Math.min(purchases.current_page * purchases.per_page, purchases.total)}{' '}
                  of {purchases.total} results
                </div>
                <div className="flex gap-2">
                  {purchases.current_page > 1 && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.get(
                          route('sales-point-purchases.index'),
                          { page: purchases.current_page - 1 },
                          { preserveState: true }
                        )
                      }
                    >
                      Previous
                    </Button>
                  )}
                  {purchases.current_page < purchases.last_page && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.get(
                          route('sales-point-purchases.index'),
                          { page: purchases.current_page + 1 },
                          { preserveState: true }
                        )
                      }
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
