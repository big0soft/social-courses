import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Edit, CheckCircle, Clock, CreditCard, Download, Mail, FileText, Eye } from 'lucide-react';

interface SalesPoint {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Admin {
  id: number;
  name: string;
  email: string;
}

interface Course {
  id: number;
  title: string;
}

interface PrepaidCard {
  id: number;
  code: string;
  card_type: string;
  price: number;
  status: string;
  course?: Course;
  bundle_courses?: Course[];
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
  notes: string | null;
  created_at: string;
  cards: PrepaidCard[];
  redeemed_cards: PrepaidCard[];
  active_cards: PrepaidCard[];
}

interface Props {
  purchase: Purchase;
  redemption_rate: number;
}

export default function Show({ purchase, redemption_rate }: Props) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    payment_status: purchase.payment_status,
    payment_method: purchase.payment_method || '',
    payment_date: purchase.payment_date || '',
    notes: purchase.notes || '',
  });

  const { data: emailData, setData: setEmailData, post: postEmail, processing: emailProcessing, errors: emailErrors } = useForm({
    email: purchase.sales_point.email,
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('sales-point-purchases.update', purchase.id), {
      onSuccess: () => setIsEditOpen(false),
    });
  };

  const handleEmailInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    postEmail(route('sales-point-purchases.invoice.email', purchase.id), {
      onSuccess: () => {
        setIsEmailOpen(false);
      },
    });
  };

  const handleDownloadInvoice = () => {
    window.location.href = route('sales-point-purchases.invoice.download', purchase.id);
  };

  const handleViewInvoice = () => {
    window.open(route('sales-point-purchases.invoice.view', purchase.id), '_blank');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getCardStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'used':
        return 'bg-blue-500/10 text-blue-500';
      case 'expired':
        return 'bg-red-500/10 text-red-500';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <Head title={`Purchase ${purchase.invoice_number}`} />

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
              <h1 className="text-3xl font-bold tracking-tight">
                Invoice {purchase.invoice_number}
              </h1>
              <p className="text-muted-foreground">
                Purchase details and card inventory
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Invoice Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewInvoice}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Invoice
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadInvoice}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEmailOpen(true)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Email Invoice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Payment
                </Button>
              </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleUpdate}>
                <DialogHeader>
                  <DialogTitle>Update Purchase Details</DialogTitle>
                  <DialogDescription>
                    Update payment status and information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={data.payment_status}
                      onValueChange={(value) => setData('payment_status', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.payment_status && (
                      <p className="text-sm text-red-500">{errors.payment_status}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Input
                      value={data.payment_method}
                      onChange={(e) => setData('payment_method', e.target.value)}
                      placeholder="e.g., Bank Transfer, Cash, Credit Card"
                    />
                    {errors.payment_method && (
                      <p className="text-sm text-red-500">{errors.payment_method}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Date</Label>
                    <Input
                      type="date"
                      value={data.payment_date}
                      onChange={(e) => setData('payment_date', e.target.value)}
                    />
                    {errors.payment_date && (
                      <p className="text-sm text-red-500">{errors.payment_date}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={data.notes}
                      onChange={(e) => setData('notes', e.target.value)}
                      placeholder="Internal notes..."
                      rows={3}
                    />
                    {errors.notes && (
                      <p className="text-sm text-red-500">{errors.notes}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing}>
                    Update
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Purchase Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales Point Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {purchase.sales_point.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {purchase.sales_point.phone}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {purchase.sales_point.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  {purchase.sales_point.address}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Purchase Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Cards</span>
                <span className="text-sm">{purchase.total_cards}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Price per Card</span>
                <span className="text-sm">
                  {formatCurrency(
                    purchase.total_cards > 0 
                      ? purchase.total_amount / purchase.total_cards 
                      : 0, 
                    purchase.currency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Amount</span>
                <span className="text-sm font-bold">
                  {formatCurrency(purchase.total_amount, purchase.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Payment Status</span>
                <Badge className={getPaymentStatusColor(purchase.payment_status)}>
                  {purchase.payment_status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Payment Method</span>
                <span className="text-sm">{purchase.payment_method || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Payment Date</span>
                <span className="text-sm">
                  {purchase.payment_date ? formatDate(purchase.payment_date) : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Processed By</span>
                <span className="text-sm">{purchase.admin.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm">{formatDate(purchase.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchase.total_cards}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchase.redeemed_cards.length}</div>
              <p className="text-xs text-muted-foreground">
                {redemption_rate.toFixed(1)}% redemption rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchase.active_cards.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(purchase.total_amount, purchase.currency)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        {purchase.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{purchase.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Cards List */}
        <Card>
          <CardHeader>
            <CardTitle>Card Inventory</CardTitle>
            <CardDescription>
              All cards included in this purchase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Course(s)</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchase.cards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No cards found
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchase.cards.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-mono text-sm">
                          {card.code}
                        </TableCell>
                        <TableCell className="capitalize">
                          {card.card_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {card.card_type === 'single_course' && card.course ? (
                            <span>{card.course.title}</span>
                          ) : card.bundle_courses && card.bundle_courses.length > 0 ? (
                            <span>
                              {card.bundle_courses.length} courses bundle
                            </span>
                          ) : (
                            <span>-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            purchase.total_cards > 0 
                              ? purchase.total_amount / purchase.total_cards 
                              : 0, 
                            purchase.currency
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCardStatusColor(card.status)}>
                            {card.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Email Invoice Dialog */}
        <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
          <DialogContent>
            <form onSubmit={handleEmailInvoice}>
              <DialogHeader>
                <DialogTitle>Email Invoice</DialogTitle>
                <DialogDescription>
                  Send invoice {purchase.invoice_number} via email
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={emailData.email}
                    onChange={(e) => setEmailData('email', e.target.value)}
                    placeholder="Enter email address"
                  />
                  {emailErrors.email && (
                    <p className="text-sm text-red-500">{emailErrors.email}</p>
                  )}
                </div>
                <div className="rounded-md bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    The invoice will be sent as a PDF attachment to the specified email address.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEmailOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={emailProcessing}>
                  {emailProcessing ? 'Sending...' : 'Send Invoice'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
