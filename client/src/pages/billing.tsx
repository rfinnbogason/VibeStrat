import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuth } from "firebase/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Calendar, DollarSign, Trash2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/queryClient";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentMethod {
  id: string;
  cardLastFour: string;
  cardBrand: string;
  isDefault: boolean;
  createdAt?: any;
}

interface SubscriptionData {
  plan: string;
  status: string;
  billingCycle: string;
  amount: number;
  nextBillingDate: string;
  trialEndsAt?: string;
}

interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: string;
  description: string;
}

// Card input form component
function AddPaymentMethodForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const auth = getAuth();
  const user = auth.currentUser;
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // Get Firebase ID token
      const token = await user.getIdToken();

      // Create SetupIntent
      const setupResponse = await fetch("/api/stripe/create-setup-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      const { clientSecret } = await setupResponse.json();

      // Confirm card setup
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Failed to add payment method");
        setProcessing(false);
        return;
      }

      // Add payment method to customer
      await fetch("/api/stripe/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          paymentMethodId: setupIntent.payment_method,
        }),
      });

      onSuccess();
      cardElement.clear();
    } catch (err: any) {
      setError(err.message || "Failed to add payment method");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-md p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? "Processing..." : "Add Payment Method"}
      </Button>
    </form>
  );
}

export default function BillingPage() {
  const auth = getAuth();
  const queryClient = useQueryClient();
  const user = auth.currentUser;

  const [successMessage, setSuccessMessage] = useState("");

  // Mock subscription data - Replace with real API call later
  const subscriptionData: SubscriptionData = {
    plan: "Free Forever",
    status: "active",
    billingCycle: "monthly",
    amount: 0,
    nextBillingDate: "N/A",
    trialEndsAt: undefined,
  };

  // Mock billing history - Replace with real API call later
  const billingHistory: BillingHistoryItem[] = [];

  // Fetch Payment Methods
  const { data: paymentMethodsData, isLoading: loadingMethods, refetch: refetchPaymentMethods } = useQuery({
    queryKey: ["paymentMethods", user?.uid],
    queryFn: async () => {
      if (!user) return { paymentMethods: [] };

      const token = await user.getIdToken();
      const response = await fetch(`/api/stripe/payment-methods/${user.uid}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }

      return response.json();
    },
    enabled: !!user,
  });

  // Set Default Payment Method
  const setDefaultMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();
      const response = await fetch("/api/stripe/payment-methods/set-default", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.uid,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to set default payment method");
      }

      return response.json();
    },
    onSuccess: () => {
      setSuccessMessage("Default payment method updated!");
      refetchPaymentMethods();
      setTimeout(() => setSuccessMessage(""), 3000);
    },
  });

  // Delete Payment Method
  const deletePaymentMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      if (!user) throw new Error("Not authenticated");

      const token = await user.getIdToken();
      const response = await fetch(`/api/stripe/payment-methods/${paymentMethodId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete payment method");
      }

      return response.json();
    },
    onSuccess: () => {
      setSuccessMessage("Payment method deleted!");
      refetchPaymentMethods();
      setTimeout(() => setSuccessMessage(""), 3000);
    },
  });

  const paymentMethods = paymentMethodsData?.paymentMethods || [];

  const handlePaymentMethodAdded = () => {
    setSuccessMessage("Payment method added successfully!");
    refetchPaymentMethods();
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-gray-500">Manage your subscription and payment methods</p>
      </div>

      {/* Subscription Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionData.plan}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Badge variant={subscriptionData.status === "active" ? "default" : "secondary"}>
                {subscriptionData.status}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${subscriptionData.amount.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground">/{subscriptionData.billingCycle}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {subscriptionData.amount === 0 ? "No charges" : "Automatically charged"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionData.nextBillingDate}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {subscriptionData.trialEndsAt ? `Trial ends ${subscriptionData.trialEndsAt}` : "Free forever"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Plan Details & Upgrade Options */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{subscriptionData.plan}</h3>
              <p className="text-sm text-muted-foreground">
                Full access to all features with no limits
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Unlimited Properties
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  All Features Included
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Priority Support
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">${subscriptionData.amount}</p>
              <p className="text-sm text-muted-foreground">per {subscriptionData.billingCycle}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {billingHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No billing history yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your invoices and receipts will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {billingHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">${item.amount.toFixed(2)}</p>
                      <Badge
                        variant={item.status === "paid" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your saved payment methods</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Payment Method Form */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-semibold">Add New Payment Method</h3>
            <Elements stripe={stripePromise}>
              <AddPaymentMethodForm onSuccess={handlePaymentMethodAdded} />
            </Elements>
          </div>

          {/* List Payment Methods */}
          {loadingMethods ? (
            <p className="text-center text-gray-500">Loading payment methods...</p>
          ) : paymentMethods.length === 0 ? (
            <p className="text-center text-gray-500">No payment methods saved yet</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-semibold capitalize">{method.cardBrand}</p>
                      <p className="text-sm text-gray-500">•••• •••• •••• {method.cardLastFour}</p>
                    </div>
                    {method.isDefault && (
                      <div className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Default
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDefaultMutation.mutate(method.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePaymentMutation.mutate(method.id)}
                      disabled={deletePaymentMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
