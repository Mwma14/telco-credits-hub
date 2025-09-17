import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  CreditCard, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreditRequest {
  id: string;
  user_id: string;
  credits_requested: number;
  amount_mmk: number;
  payment_method: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
}

interface Order {
  id: string;
  user_id: string;
  phone_number: string;
  price_credits: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
  products: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  credits: number;
  role: string;
  is_banned: boolean;
  created_at: string;
}

export default function AdminPanel() {
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin' && user.email !== "thewayofthedragg@gmail.com") {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have admin privileges.",
        });
        navigate("/");
        return;
      }

      // Fetch credit requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('credit_requests')
        .select(`
          *,
          users (name, email)
        `)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          users (name, email),
          products (name)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setCreditRequests(requestsData || []);
      setOrders(ordersData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreditRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const request = creditRequests.find(r => r.id === requestId);
      if (!request) return;

      // Update credit request status
      const { error: updateError } = await supabase
        .from('credit_requests')
        .update({
          status: action,
          admin_notes: adminNotes || null
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, add credits to user account
      if (action === 'approved') {
        const { error: creditsError } = await supabase.rpc('increment_user_credits', {
          user_id: request.user_id,
          credit_amount: request.credits_requested
        });

        if (creditsError) throw creditsError;
      }

      toast({
        title: `Request ${action}`,
        description: `Credit request has been ${action}.`,
      });

      // Refresh data
      fetchAllData();
      setSelectedRequest(null);
      setAdminNotes("");

    } catch (error) {
      console.error('Error updating credit request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update request.",
      });
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, status: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          admin_notes: notes || null
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Updated",
        description: "Order status has been updated.",
      });

      fetchAllData();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order.",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
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
      case 'approved':
      case 'completed':
        return 'bg-success/20 text-success';
      case 'rejected':
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
          <p className="text-muted-foreground">Loading admin panel...</p>
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
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 text-brand-orange" />
                Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage users, orders and credit requests
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="credit-requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credit-requests">
              <CreditCard className="h-4 w-4 mr-2" />
              Credit Requests ({creditRequests.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
          </TabsList>

          {/* Credit Requests Tab */}
          <TabsContent value="credit-requests">
            <div className="space-y-4">
              {creditRequests.map((request) => (
                <Card key={request.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {request.credits_requested} Credits Request
                        </CardTitle>
                        <CardDescription>
                          {request.users.name} ({request.users.email})
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-medium">{request.amount_mmk.toLocaleString()} MMK</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Credits</p>
                          <p className="font-medium">{request.credits_requested} C</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Method</p>
                          <p className="font-medium capitalize">{request.payment_method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {request.admin_notes && (
                        <div>
                          <p className="text-sm text-muted-foreground">Admin Notes</p>
                          <p className="text-sm bg-muted p-2 rounded">{request.admin_notes}</p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="border-t pt-4">
                          <div className="space-y-2 mb-4">
                            <label className="text-sm font-medium">Admin Notes</label>
                            <Textarea
                              placeholder="Add notes for this request..."
                              value={selectedRequest === request.id ? adminNotes : ''}
                              onChange={(e) => {
                                setSelectedRequest(request.id);
                                setAdminNotes(e.target.value);
                              }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleCreditRequestAction(request.id, 'approved')}
                              className="bg-success hover:bg-success/90"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleCreditRequestAction(request.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {order.products.name}
                        </CardTitle>
                        <CardDescription>
                          {order.users.name} ({order.users.email})
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Phone Number</p>
                          <p className="font-medium">{order.phone_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="font-medium">{order.price_credits.toFixed(1)} C</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Order ID</p>
                          <p className="font-medium text-xs">{order.id.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {order.admin_notes && (
                        <div>
                          <p className="text-sm text-muted-foreground">Admin Notes</p>
                          <p className="text-sm bg-muted p-2 rounded">{order.admin_notes}</p>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <div className="flex gap-4">
                          <Select
                            value={order.status}
                            onValueChange={(status) => handleOrderStatusUpdate(order.id, status, '')}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {user.role}
                        </Badge>
                        {user.is_banned && (
                          <Badge variant="destructive">Banned</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Credits</p>
                        <p className="font-medium text-brand-orange">{user.credits.toFixed(2)} C</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">User ID</p>
                        <p className="font-medium text-xs">{user.id.slice(0, 8)}...</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Joined</p>
                        <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}