import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, CreditCard, Tag } from 'lucide-react';
import axios from 'axios';

interface Course {
  id: number;
  title: string;
}

interface CardInfo {
  code: string;
  card_type: 'single_course' | 'bundle';
  title?: string;
  description?: string;
  price: number;
  currency: string;
  course?: Course;
  bundleCourses: Course[];
  alreadyEnrolled: number[];
  courses_to_enroll: number;
}

interface PrepaidCardInputProps {
  onSuccess?: () => void;
  courseId?: number; // Optional: For course-specific redemption
  className?: string;
  compact?: boolean; // Compact mode for inline display
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

export default function PrepaidCardInput({
  onSuccess,
  courseId,
  className = '',
  compact = false
}: PrepaidCardInputProps) {
  const [cardCode, setCardCode] = useState('');
  const [validationState, setValidationState] = useState<ValidationState>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [canRedeem, setCanRedeem] = useState(false);

  const { data, setData, post, processing } = useForm({
    code: '',
  });

  // Auto-format card code as user types (add hyphens)
  const handleCodeChange = (value: string) => {
    // Remove all non-alphanumeric characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    // Add hyphens every 4 characters
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;

    setCardCode(formatted);

    // Reset validation when code changes
    if (validationState !== 'idle') {
      setValidationState('idle');
      setCardInfo(null);
      setCanRedeem(false);
    }
  };

  const validateCard = async () => {
    if (!cardCode.trim()) {
      setValidationMessage('Please enter a card code');
      return;
    }

    setValidationState('validating');
    setValidationMessage('');

    try {
      const response = await axios.post(route('card.redeem.validate'), {
        code: cardCode,
      });

      if (response.data.valid) {
        setValidationState('valid');
        setCardInfo(response.data.card);
        setCanRedeem(response.data.can_redeem);
        setValidationMessage(response.data.message);

        // Check if card matches the current course (if courseId provided)
        if (courseId && response.data.card) {
          const matchesCourse =
            (response.data.card.card_type === 'single_course' && response.data.card.course?.id === courseId) ||
            (response.data.card.card_type === 'bundle' && response.data.card.bundleCourses.some((c: Course) => c.id === courseId));

          if (!matchesCourse) {
            setValidationState('invalid');
            setValidationMessage('This card cannot be used for this course.');
            setCanRedeem(false);
          }
        }
      } else {
        setValidationState('invalid');
        setValidationMessage(response.data.message);
        setCanRedeem(false);
      }
    } catch (error) {
      setValidationState('invalid');

      if (axios.isAxiosError(error)) {
        if (error.response) {
          setValidationMessage(error.response.data?.message || 'Invalid card code');
        } else if (error.request) {
          setValidationMessage('Network error. Please check your connection and try again.');
        } else {
          setValidationMessage('An unexpected error occurred');
        }
      } else {
        setValidationMessage('An unexpected error occurred');
      }

      setCanRedeem(false);
    }
  };

  const handleRedeem = () => {
    // Set the form data before posting
    setData('code', cardCode);

    post(route('card.redeem.activate'), {
      onSuccess: () => {
        setCardCode('');
        setValidationState('idle');
        setCardInfo(null);
        setCanRedeem(false);
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (errors) => {
        setValidationState('invalid');
        setValidationMessage(errors.code || 'Failed to redeem card. Please try again.');
      },
    });
  };

  // Render compact version
  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              value={cardCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              disabled={validationState === 'validating' || processing}
              onKeyPress={(e) => e.key === 'Enter' && validateCard()}
              className="font-mono"
            />
          </div>
          {validationState === 'idle' && (
            <Button
              type="button"
              onClick={validateCard}
              disabled={!cardCode.trim()}
              variant="outline"
            >
              Validate
            </Button>
          )}
          {validationState === 'valid' && canRedeem && (
            <Button
              type="button"
              onClick={handleRedeem}
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redeem'}
            </Button>
          )}
        </div>

        {/* Validation Feedback */}
        {validationState === 'validating' && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Validating card...</span>
          </div>
        )}

        {validationState === 'valid' && cardInfo && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>{cardInfo.card_type === 'single_course' ? cardInfo.course?.title : cardInfo.title}</strong>
              {canRedeem ? (
                <span className="block text-sm">Ready to redeem!</span>
              ) : (
                <span className="block text-sm">{validationMessage}</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {validationState === 'invalid' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{validationMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Render full version
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Have a Prepaid Card?
        </CardTitle>
        <CardDescription>
          Enter your prepaid card code to redeem and get instant access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Card Code Input */}
        <div className="space-y-2">
          <Label>Card Code</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={cardCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                disabled={validationState === 'validating' || processing}
                onKeyPress={(e) => e.key === 'Enter' && validateCard()}
                className="font-mono text-lg"
              />
            </div>
            {validationState === 'idle' && (
              <Button
                type="button"
                onClick={validateCard}
                disabled={!cardCode.trim()}
              >
                Validate
              </Button>
            )}
          </div>
        </div>

        {/* Validation Loading */}
        {validationState === 'validating' && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Validating your card code...</span>
          </div>
        )}

        {/* Card Information (Valid) */}
        {validationState === 'valid' && cardInfo && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Card Validated Successfully!</strong>
                <p className="text-sm mt-1">{validationMessage}</p>
              </AlertDescription>
            </Alert>

            {/* Card Details */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {cardInfo.card_type === 'single_course'
                        ? cardInfo.course?.title
                        : cardInfo.title || 'Course Bundle'}
                    </span>
                  </div>
                  {cardInfo.description && (
                    <p className="text-sm text-muted-foreground">{cardInfo.description}</p>
                  )}
                </div>
                <Badge variant={cardInfo.card_type === 'single_course' ? 'default' : 'secondary'}>
                  {cardInfo.card_type === 'single_course' ? 'Single Course' : 'Bundle'}
                </Badge>
              </div>

              {/* Bundle Courses List */}
              {cardInfo.card_type === 'bundle' && cardInfo.bundleCourses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Includes {cardInfo.bundleCourses.length} courses:</p>
                  <ul className="space-y-1">
                    {cardInfo.bundleCourses.map((course) => (
                      <li key={course.id} className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span className={cardInfo.alreadyEnrolled.includes(course.id) ? 'text-muted-foreground line-through' : ''}>
                          {course.title}
                        </span>
                        {cardInfo.alreadyEnrolled.includes(course.id) && (
                          <Badge variant="outline" className="text-xs">Already Enrolled</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Already Enrolled Warning */}
              {cardInfo.alreadyEnrolled.length > 0 && cardInfo.courses_to_enroll === 0 && (
                <Alert>
                  <AlertDescription>
                    You are already enrolled in all courses included in this card.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Redeem Button */}
            {canRedeem && (
              <Button
                type="button"
                onClick={handleRedeem}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    Redeem Card & Get Access
                    {cardInfo.courses_to_enroll > 0 && ` (${cardInfo.courses_to_enroll} course${cardInfo.courses_to_enroll > 1 ? 's' : ''})`}
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Error Message */}
        {validationState === 'invalid' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-5 w-5" />
              <AlertDescription>{validationMessage}</AlertDescription>
            </Alert>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCardCode('');
                setValidationState('idle');
                setValidationMessage('');
              }}
              className="w-full"
            >
              Try Another Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
