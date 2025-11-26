import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Calculator,
  CreditCard,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
} from 'lucide-react';
import axios from 'axios';

interface SalesPoint {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Course {
  id: number;
  title: string;
  price: number;
  currency?: string; // Optional, defaults to USD in the application
}

interface PrepaidCard {
  id: number;
  code: string;
  card_type: string;
  price: number;
  batch_id: string;
  course?: Course;
}

interface DiscountTiers {
  [key: number]: number;
}

interface PricingCalculation {
  base_price_per_card: number;
  quantity: number;
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  final_total: number;
  price_per_card_after_discount: number;
}

interface CardBatch {
  id: string;
  card_type: 'single_course' | 'bundle';
  course_id?: number;
  course_ids?: number[];
  quantity: number;
  price: number;
  title?: string;
  description?: string;
  expires_at?: string;
  notes?: string;
}

interface Props {
  salesPoints: SalesPoint[];
  availableCards: { [batch_id: string]: PrepaidCard[] };
  courses: Course[];
}

export default function Create({ salesPoints, availableCards, courses }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    sales_point_id: '',
    card_source: 'existing' as 'existing' | 'generate',
    existing_card_ids: [] as number[],
    card_batches: [] as CardBatch[],
    total_cards: 0,
    base_price: '',
    payment_status: 'paid' as 'paid' | 'pending' | 'partial',
    payment_method: '',
    payment_date: new Date().toISOString().split('T')[0],
    credit_days: '',
    notes: '',
  });

  const [pricing, setPricing] = useState<PricingCalculation | null>(null);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

  // Batch management state
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [batchForm, setBatchForm] = useState<CardBatch>({
    id: '',
    card_type: 'single_course',
    quantity: 1,
    price: 0,
  });

  // Calculate total cards from selected cards
  useEffect(() => {
    if (data.card_source === 'existing') {
      setData('total_cards', data.existing_card_ids.length);
    }
  }, [data.existing_card_ids, data.card_source]);

  // Calculate pricing whenever relevant fields change
  useEffect(() => {
    if (data.total_cards > 0 && data.base_price && parseFloat(data.base_price) > 0) {
      calculatePrice();
    }
  }, [data.total_cards, data.base_price]);

  const calculatePrice = async () => {
    try {
      const basePrice = parseFloat(data.base_price) || 0;
      const quantity = data.total_cards;
      const subtotal = basePrice * quantity;
      
      // Simple pricing without discounts
      setPricing({
        base_price_per_card: basePrice,
        quantity: quantity,
        subtotal: subtotal,
        discount_percent: 0,
        discount_amount: 0,
        final_total: subtotal,
        price_per_card_after_discount: basePrice,
      });
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  // Calculate totals from batches when generating
  useEffect(() => {
    if (data.card_source === 'generate' && data.card_batches.length > 0) {
      const totalCards = data.card_batches.reduce((sum, batch) => sum + batch.quantity, 0);

      setData({
        ...data,
        total_cards: totalCards,
      });
    }
  }, [data.card_batches]);

  // Batch management functions
  const handleAddBatch = () => {
    setIsAddingBatch(true);
    setEditingBatchId(null);
    setBatchForm({
      id: Date.now().toString(),
      card_type: 'single_course',
      quantity: 1,
      price: 0,
    });
  };

  const handleEditBatch = (batch: CardBatch) => {
    setIsAddingBatch(true);
    setEditingBatchId(batch.id);
    setBatchForm({ ...batch });
  };

  const handleSaveBatch = () => {
    // Validation
    if (batchForm.card_type === 'single_course' && !batchForm.course_id) {
      alert('Please select a course');
      return;
    }
    if (batchForm.card_type === 'bundle' && (!batchForm.course_ids || batchForm.course_ids.length < 2)) {
      alert('Please select at least 2 courses for a bundle');
      return;
    }
    if (batchForm.quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }
    if (batchForm.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    let updatedBatches: CardBatch[];
    if (editingBatchId) {
      // Update existing batch
      updatedBatches = data.card_batches.map((b) =>
        b.id === editingBatchId ? batchForm : b
      );
    } else {
      // Add new batch
      updatedBatches = [...data.card_batches, batchForm];
    }

    setData('card_batches', updatedBatches);
    setIsAddingBatch(false);
    setEditingBatchId(null);
  };

  const handleCancelBatch = () => {
    setIsAddingBatch(false);
    setEditingBatchId(null);
  };

  const handleRemoveBatch = (batchId: string) => {
    setData('card_batches', data.card_batches.filter((b) => b.id !== batchId));
  };

  const getCourseName = (courseId: number) => {
    return courses.find((c) => c.id === courseId)?.title || 'Unknown Course';
  };

  const handleBatchSelection = (batchId: string, checked: boolean) => {
    if (checked) {
      setSelectedBatches([...selectedBatches, batchId]);
      const batchCards = availableCards[batchId].map((card) => card.id);
      setData('existing_card_ids', [...data.existing_card_ids, ...batchCards]);
    } else {
      setSelectedBatches(selectedBatches.filter((id) => id !== batchId));
      const batchCards = availableCards[batchId].map((card) => card.id);
      setData(
        'existing_card_ids',
        data.existing_card_ids.filter((id) => !batchCards.includes(id))
      );
    }
  };

  const handleCardSelection = (cardId: number, checked: boolean) => {
    if (checked) {
      setData('existing_card_ids', [...data.existing_card_ids, cardId]);
    } else {
      setData('existing_card_ids', data.existing_card_ids.filter((id) => id !== cardId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('sales-point-purchases.store'));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <Head title="Sell Cards to Sales Point" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={route('sales-point-purchases.index')}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Sell Cards to Sales Point
            </h1>
            <p className="text-muted-foreground">
              Create a new card purchase for a sales point
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="space-y-6 lg:col-span-2">
              {/* Sales Point Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>1. Select Sales Point</CardTitle>
                  <CardDescription>Choose the sales point purchasing cards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Sales Point *</Label>
                    <Select
                      value={data.sales_point_id}
                      onValueChange={(value) => setData('sales_point_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sales point" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesPoints.map((sp) => (
                          <SelectItem key={sp.id} value={sp.id.toString()}>
                            <div>
                              <div className="font-medium">{sp.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {sp.phone} • {sp.email}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sales_point_id && (
                      <p className="text-sm text-red-500">{errors.sales_point_id}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card Source */}
              <Card>
                <CardHeader>
                  <CardTitle>2. Card Source</CardTitle>
                  <CardDescription>
                    Choose existing cards or generate new ones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={data.card_source}
                    onValueChange={(value: 'existing' | 'generate') => {
                      setData('card_source', value);
                      // Clear the opposite field when switching
                      if (value === 'existing') {
                        setData('card_batches', []);
                      } else {
                        setData('existing_card_ids', []);
                        setSelectedBatches([]);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="existing" />
                      <Label htmlFor="existing">Use Existing Cards</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="generate" id="generate" />
                      <Label htmlFor="generate">Generate New Cards</Label>
                    </div>
                  </RadioGroup>

                  {/* Existing Cards Selection */}
                  {data.card_source === 'existing' && (
                    <div className="mt-4 space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Select cards from available batches
                      </div>
                      {Object.keys(availableCards).length === 0 ? (
                        <div className="rounded-md border p-8 text-center">
                          <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            No available cards in inventory
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Generate new cards instead
                          </p>
                        </div>
                      ) : (
                        Object.entries(availableCards).map(([batchId, cards]) => (
                          <Card key={batchId}>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={selectedBatches.includes(batchId)}
                                    onCheckedChange={(checked) =>
                                      handleBatchSelection(batchId, checked as boolean)
                                    }
                                  />
                                  <div>
                                    <CardTitle className="text-base">
                                      Batch {batchId}
                                    </CardTitle>
                                    <CardDescription>
                                      {cards.length} cards available
                                    </CardDescription>
                                  </div>
                                </div>
                                <Badge>{cards[0].card_type.replace('_', ' ')}</Badge>
                              </div>
                            </CardHeader>
                          </Card>
                        ))
                      )}
                      {errors.existing_card_ids && (
                        <p className="text-sm text-red-500">{errors.existing_card_ids}</p>
                      )}
                    </div>
                  )}

                  {/* Generate New Cards */}
                  {data.card_source === 'generate' && (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-md bg-blue-50 p-4">
                        <div className="flex gap-2">
                          <AlertCircle className="h-5 w-5 text-blue-500" />
                          <div className="text-sm text-blue-700">
                            New cards will be generated and automatically assigned to this
                            sales point. Add batches with different configurations below.
                          </div>
                        </div>
                      </div>

                      {/* List of batches */}
                      {data.card_batches.length > 0 && (
                        <div className="space-y-2">
                          {data.card_batches.map((batch: CardBatch) => (
                            <Card key={batch.id}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge variant={batch.card_type === 'single_course' ? 'default' : 'secondary'}>
                                        {batch.card_type === 'single_course' ? 'Single Course' : 'Bundle'}
                                      </Badge>
                                      <span className="text-sm font-medium">
                                        {batch.quantity} cards × ${batch.price.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {batch.card_type === 'single_course' && batch.course_id && (
                                        <div>{getCourseName(batch.course_id)}</div>
                                      )}
                                      {batch.card_type === 'bundle' && batch.course_ids && (
                                        <div>
                                          {batch.title || 'Bundle'}: {batch.course_ids.length} courses
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditBatch(batch)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveBatch(batch.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {/* Add/Edit batch form */}
                      {isAddingBatch ? (
                        <Card className="border-2 border-blue-200">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                {editingBatchId ? 'Edit Batch' : 'Add New Batch'}
                              </CardTitle>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleCancelBatch}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Card Type */}
                            <div className="space-y-2">
                              <Label>Card Type *</Label>
                              <RadioGroup
                                value={batchForm.card_type}
                                onValueChange={(value: 'single_course' | 'bundle') => {
                                  setBatchForm({
                                    ...batchForm,
                                    card_type: value,
                                    course_id: undefined,
                                    course_ids: undefined,
                                    title: undefined,
                                  });
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="single_course" id="single" />
                                  <Label htmlFor="single">Single Course</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="bundle" id="bundle" />
                                  <Label htmlFor="bundle">Course Bundle</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {/* Single Course Selection */}
                            {batchForm.card_type === 'single_course' && (
                              <div className="space-y-2">
                                <Label>Course *</Label>
                                <Select
                                  value={batchForm.course_id?.toString()}
                                  onValueChange={(value) =>
                                    setBatchForm({ ...batchForm, course_id: parseInt(value) })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {courses.map((course) => (
                                      <SelectItem key={course.id} value={course.id.toString()}>
                                        {course.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {/* Bundle Course Selection */}
                            {batchForm.card_type === 'bundle' && (
                              <>
                                <div className="space-y-2">
                                  <Label>Bundle Title</Label>
                                  <Input
                                    value={batchForm.title || ''}
                                    onChange={(e) =>
                                      setBatchForm({ ...batchForm, title: e.target.value })
                                    }
                                    placeholder="e.g., Web Development Bundle"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Courses (Select at least 2) *</Label>
                                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                                    {courses.map((course) => (
                                      <div key={course.id} className="flex items-center gap-2">
                                        <Checkbox
                                          checked={batchForm.course_ids?.includes(course.id)}
                                          onCheckedChange={(checked) => {
                                            const currentIds = batchForm.course_ids || [];
                                            const newIds = checked
                                              ? [...currentIds, course.id]
                                              : currentIds.filter((id) => id !== course.id);
                                            setBatchForm({ ...batchForm, course_ids: newIds });
                                          }}
                                        />
                                        <Label className="cursor-pointer">{course.title}</Label>
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Selected: {batchForm.course_ids?.length || 0} courses
                                  </p>
                                </div>
                              </>
                            )}

                            {/* Quantity */}
                            <div className="space-y-2">
                              <Label>Number of Cards *</Label>
                              <Input
                                type="number"
                                min="1"
                                value={batchForm.quantity}
                                onChange={(e) =>
                                  setBatchForm({ ...batchForm, quantity: parseInt(e.target.value) || 1 })
                                }
                              />
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                              <Label>Price per Card (USD) *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={batchForm.price}
                                onChange={(e) =>
                                  setBatchForm({ ...batchForm, price: parseFloat(e.target.value) || 0 })
                                }
                              />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                              <Label>Description (Optional)</Label>
                              <Textarea
                                value={batchForm.description || ''}
                                onChange={(e) =>
                                  setBatchForm({ ...batchForm, description: e.target.value })
                                }
                                placeholder="Card description..."
                                rows={2}
                              />
                            </div>

                            {/* Expiration Date */}
                            <div className="space-y-2">
                              <Label>Expiration Date (Optional)</Label>
                              <Input
                                type="date"
                                value={batchForm.expires_at || ''}
                                onChange={(e) =>
                                  setBatchForm({ ...batchForm, expires_at: e.target.value })
                                }
                                min={new Date().toISOString().split('T')[0]}
                              />
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                              <Label>Notes (Optional)</Label>
                              <Textarea
                                value={batchForm.notes || ''}
                                onChange={(e) =>
                                  setBatchForm({ ...batchForm, notes: e.target.value })
                                }
                                placeholder="Internal notes..."
                                rows={2}
                              />
                            </div>

                            {/* Save/Cancel buttons */}
                            <div className="flex gap-2">
                              <Button type="button" onClick={handleSaveBatch} className="flex-1">
                                <Save className="h-4 w-4 mr-2" />
                                Save Batch
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelBatch}
                              >
                                Cancel
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddBatch}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Card Batch
                        </Button>
                      )}

                      {errors.card_batches && (
                        <p className="text-sm text-red-500">{errors.card_batches}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>3. Pricing</CardTitle>
                  <CardDescription>
                    Set the base price per card
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Base Price per Card (USD) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data.base_price}
                      onChange={(e) => setData('base_price', e.target.value)}
                      placeholder="Enter price per card"
                    />
                    {errors.base_price && (
                      <p className="text-sm text-red-500">{errors.base_price}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Total: {data.total_cards} cards × ${parseFloat(data.base_price) || 0} = ${(data.total_cards * (parseFloat(data.base_price) || 0)).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>4. Payment Details</CardTitle>
                  <CardDescription>Configure payment terms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Status *</Label>
                    <Select
                      value={data.payment_status}
                      onValueChange={(value: any) => setData('payment_status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid (Immediate)</SelectItem>
                        <SelectItem value="pending">Pending (Credit Terms)</SelectItem>
                        <SelectItem value="partial">Partial Payment</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.payment_status && (
                      <p className="text-sm text-red-500">{errors.payment_status}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={data.payment_method}
                      onValueChange={(value) => setData('payment_method', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.payment_method && (
                      <p className="text-sm text-red-500">{errors.payment_method}</p>
                    )}
                  </div>

                  {data.payment_status === 'paid' && (
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
                  )}

                  {data.payment_status === 'pending' && (
                    <div className="space-y-2">
                      <Label>Credit Terms (Days)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={data.credit_days}
                        onChange={(e) => setData('credit_days', e.target.value)}
                        placeholder="e.g., 30"
                      />
                      {errors.credit_days && (
                        <p className="text-sm text-red-500">{errors.credit_days}</p>
                      )}
                    </div>
                  )}

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
                </CardContent>
              </Card>
            </div>

            {/* Pricing Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Pricing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pricing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base Price</span>
                          <span>{formatCurrency(pricing.base_price_per_card)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Quantity</span>
                          <span>{pricing.quantity} cards</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>{formatCurrency(pricing.subtotal)}</span>
                        </div>
                      </div>


                      <div className="border-t pt-4">
                        <div className="flex justify-between">
                          <span className="text-lg font-bold">Total</span>
                          <span className="text-lg font-bold">
                            {formatCurrency(pricing.final_total)}
                          </span>
                        </div>
                        <div className="mt-1 text-right text-sm text-muted-foreground">
                          {formatCurrency(pricing.price_per_card_after_discount)} per card
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Purchase'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center text-sm text-muted-foreground">
                        <Calculator className="mx-auto h-8 w-8 opacity-20" />
                        <p className="mt-2">Configure details to see pricing</p>
                      </div>
                      <Button type="submit" className="w-full" disabled={processing || !data.sales_point_id || (data.card_source === 'existing' && data.existing_card_ids.length === 0) || (data.card_source === 'generate' && data.card_batches.length === 0)}>
                        {processing ? 'Creating...' : 'Create Purchase'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
