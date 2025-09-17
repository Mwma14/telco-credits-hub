import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  phone_number: string;
  price_credits: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  products: {
    name: string;
    description: string | null;
    operators: {
      display_name: string;
      color_scheme: string;
    };
    categories: {
      display_name: string;
      icon: string;
    };
  };
}

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            name,
            description,
            operators (display_name, color_scheme),
            categories (display_name, icon)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        variant: "destructive",
        title: "Error loading orders",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success';
      case 'failed':
        return 'bg-destructive/20 text-destructive';
      case 'processing':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-brand-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
              <p className="text-sm text-muted-foreground">
                {orders.length} orders found
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't made any purchases yet. Start browsing our products!
              </p>
              <Button onClick={() => navigate("/products")}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {order.products.name}
                      </CardTitle>
                      <CardDescription>
                        Order #{order.id.slice(0, 8)}...
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Product Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          style={{ 
                            backgroundColor: `${order.products.operators.color_scheme}20`, 
                            color: order.products.operators.color_scheme 
                          }}
                        >
                          {order.products.operators.display_name}
                        </Badge>
                        <Badge variant="outline">
                          {order.products.categories.icon} {order.products.categories.display_name}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-brand-orange">
                          {order.price_credits.toFixed(1)} Credits
                        </p>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{order.phone_number}</p>
                    </div>

                    {/* Product Description */}
                    {order.products.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{order.products.description}</p>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {order.admin_notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Admin Notes</p>
                        <p className="text-sm bg-muted p-2 rounded">{order.admin_notes}</p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                      <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(order.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}