import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BuyCredits() {
  const [credits, setCredits] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const creditPackages = [
    { credits: 100, mmk: 10000, popular: false },
    { credits: 250, mmk: 25000, popular: false },
    { credits: 500, mmk: 50000, popular: true },
    { credits: 1000, mmk: 100000, popular: false },
    { credits: 2500, mmk: 250000, popular: false },
  ];

  const paymentMethods = [
    {
      id: "kpay",
      name: "KPay",
      description: "Transfer via KPay app",
      instructions: "Send payment to: 09123456789 (KPay)"
    },
    {
      id: "waypay", 
      name: "WayPay",
      description: "Transfer via WayPay app",
      instructions: "Send payment to: 09123456789 (WayPay)"
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!credits || !paymentMethod || !paymentProof) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields and upload payment proof.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const creditsRequested = parseFloat(credits);
      const amountMMK = creditsRequested * 100; // 1 credit = 100 MMK

      // Create credit request record
      const { error: insertError } = await supabase
        .from('credit_requests')
        .insert([
          {
            user_id: user.id,
            credits_requested: creditsRequested,
            amount_mmk: amountMMK,
            payment_method: paymentMethod as any,
            admin_notes: notes || null,
            status: 'pending'
          }
        ]);

      if (insertError) throw insertError;

      toast({
        title: "Request Submitted Successfully",
        description: "Your credit request has been submitted and is pending admin approval.",
      });

      // Reset form
      setCredits("");
      setPaymentMethod("");
      setPaymentProof(null);
      setNotes("");
      
      // Navigate back to main page
      navigate("/");

    } catch (error) {
      console.error('Error submitting credit request:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Failed to submit your request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Buy Credits</h1>
              <p className="text-sm text-muted-foreground">
                Top up your account balance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Credit Packages */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Choose Credit Package
              </CardTitle>
              <CardDescription>
                Select a predefined package or enter custom amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {creditPackages.map((pkg) => (
                  <Card
                    key={pkg.credits}
                    className={`cursor-pointer transition-all hover:border-brand-orange/50 ${
                      credits === pkg.credits.toString() ? 'border-brand-orange' : ''
                    } ${pkg.popular ? 'ring-2 ring-brand-orange/20' : ''}`}
                    onClick={() => setCredits(pkg.credits.toString())}
                  >
                    <CardContent className="p-4 text-center">
                      {pkg.popular && (
                        <div className="text-xs bg-brand-orange text-white px-2 py-1 rounded-full mb-2">
                          Popular
                        </div>
                      )}
                      <div className="text-2xl font-bold text-brand-orange">
                        {pkg.credits}C
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pkg.mmk.toLocaleString()} MMK
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-credits">Custom Amount (Credits)</Label>
                <Input
                  id="custom-credits"
                  type="number"
                  placeholder="Enter custom amount"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                />
                {credits && (
                  <p className="text-sm text-muted-foreground">
                    Total: {parseFloat(credits) * 100} MMK ({parseFloat(credits)} Credits)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Choose your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-start space-x-2 p-4 border border-border rounded-lg">
                    <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                    <div className="grid gap-1.5 leading-none flex-1">
                      <label
                        htmlFor={method.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {method.name}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {method.description}
                      </p>
                      {paymentMethod === method.id && (
                        <div className="mt-2 p-2 bg-brand-orange/10 rounded border">
                          <p className="text-sm font-medium text-brand-orange">
                            Payment Instructions:
                          </p>
                          <p className="text-sm">{method.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Proof Upload */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Payment Proof</CardTitle>
              <CardDescription>
                Upload screenshot of your payment confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="payment-proof" className="cursor-pointer">
                      <span className="text-sm font-medium">Click to upload payment screenshot</span>
                      <Input
                        id="payment-proof"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
                {paymentProof && (
                  <p className="text-sm text-success">
                    ✓ File selected: {paymentProof.name}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information for the admin..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!credits || !paymentMethod || !paymentProof || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Credit Request"}
          </Button>
        </div>
      </main>
    </div>
  );
}