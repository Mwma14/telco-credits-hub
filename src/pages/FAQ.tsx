import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FAQ() {
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "How do I buy credits?",
      answer: "To buy credits, go to the 'Buy Credits' section, choose your desired amount, select a payment method (KPay or WayPay), make the payment, and upload a screenshot as proof. Your credits will be added after admin approval."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We currently accept KPay and WayPay transfers. After making the payment, you need to upload a screenshot of the transaction as proof."
    },
    {
      question: "How long does it take to get credits after payment?",
      answer: "Credit approval typically takes 1-24 hours during business hours. Once approved by our admin, credits will be automatically added to your account."
    },
    {
      question: "What can I buy with credits?",
      answer: "You can use credits to purchase various telecom products including data packages, minutes, points, bundled packages, and beautiful numbers from operators like ATOM, MPT, Mytel, and Ooredoo."
    },
    {
      question: "How do I check my order status?",
      answer: "You can check your order status in the 'My Orders' section. Orders go through stages: Pending → Processing → Completed. You'll see updates and admin notes there."
    },
    {
      question: "What if my payment was deducted but credits weren't added?",
      answer: "If your payment was successful but credits weren't added, please contact our admin through the contact option in your profile menu. Include your payment screenshot and transaction details."
    },
    {
      question: "Can I get a refund for my credits?",
      answer: "Credit purchases are generally non-refundable. However, if there's an issue with your order or a technical problem, please contact our admin for assistance."
    },
    {
      question: "How do I use my credits to buy products?",
      answer: "Browse the products section, select your desired item, enter your phone number, and confirm the purchase. The credits will be deducted from your account automatically."
    },
    {
      question: "What are beautiful numbers?",
      answer: "Beautiful numbers are special phone numbers with attractive patterns like repeating digits (e.g., 09111111111) or sequential numbers. They're available for purchase from various operators."
    },
    {
      question: "Can I transfer credits to another user?",
      answer: "Currently, credit transfers between users are not available. Each account's credits can only be used by the account owner."
    },
    {
      question: "What if I entered the wrong phone number for my order?",
      answer: "If you entered an incorrect phone number, contact our admin immediately through the profile menu. We may be able to update it if the order hasn't been processed yet."
    },
    {
      question: "Are there any fees for using the platform?",
      answer: "There are no additional fees for using our platform. The price you see for credits and products is the final price you pay."
    }
  ];

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
              <h1 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h1>
              <p className="text-sm text-muted-foreground">
                Find answers to common questions
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Contact Support Card */}
          <Card className="bg-gradient-primary border-brand-orange">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageCircle className="h-5 w-5" />
                Need More Help?
              </CardTitle>
              <CardDescription className="text-white/80">
                Can't find what you're looking for? Contact our admin for personalized support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 text-sm">
                Use the "Contact Admin" option in your profile menu to get direct assistance.
              </p>
            </CardContent>
          </Card>

          {/* FAQ Accordion */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Common Questions & Answers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:text-brand-orange">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardContent className="p-6" onClick={() => navigate("/buy-credits")}>
                <div className="text-center">
                  <div className="h-12 w-12 bg-brand-orange/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-brand-orange" />
                  </div>
                  <h3 className="font-semibold mb-2">Buy Credits</h3>
                  <p className="text-sm text-muted-foreground">
                    Top up your account balance
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-brand-orange/50 transition-colors cursor-pointer">
              <CardContent className="p-6" onClick={() => navigate("/products")}>
                <div className="text-center">
                  <div className="h-12 w-12 bg-brand-orange/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <HelpCircle className="h-6 w-6 text-brand-orange" />
                  </div>
                  <h3 className="font-semibold mb-2">Browse Products</h3>
                  <p className="text-sm text-muted-foreground">
                    View available services
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}