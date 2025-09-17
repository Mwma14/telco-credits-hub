import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  ChevronDown, 
  ShoppingBag, 
  CreditCard, 
  FileText, 
  HelpCircle,
  User,
  MessageCircle,
  LogOut,
  Shield
} from "lucide-react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface MainLayoutProps {
  user: SupabaseUser;
  session: Session;
  onSignOut: () => void;
}

interface UserProfile {
  credits: number;
  role: string;
}

export default function MainLayout({ user, session, onSignOut }: MainLayoutProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const isAdmin = user.email === "thewayofthedragg@gmail.com" || userProfile?.role === 'admin';

  useEffect(() => {
    fetchUserProfile();
  }, [user.id]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // Create user profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || user.email!.split('@')[0],
              credits: 0,
              role: user.email === "thewayofthedragg@gmail.com" ? 'admin' : 'user'
            }
          ]);
        
        if (insertError) {
          console.error('Error creating user profile:', insertError);
        } else {
          setUserProfile({
            credits: 0,
            role: user.email === "thewayofthedragg@gmail.com" ? 'admin' : 'user'
          });
        }
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      onSignOut();
    }
  };

  const mainMenuItems = [
    {
      icon: ShoppingBag,
      title: "Browse Products",
      description: "View our catalog of digital goods.",
      onClick: () => navigate("/products")
    },
    {
      icon: CreditCard,
      title: "Buy Credits",
      description: "Top up your account balance.",
      onClick: () => toast({ title: "Feature coming soon!" })
    },
    {
      icon: FileText,
      title: "My Orders",
      description: "Check your order history and status.",
      onClick: () => toast({ title: "Feature coming soon!" })
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Find answers to common questions.",
      onClick: () => toast({ title: "Feature coming soon!" })
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-brand-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-8 w-8 text-brand-orange fill-current" />
              <h1 className="text-2xl font-bold text-foreground">Operators Store</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* User Credits */}
              <div className="text-right hidden sm:block">
                <p className="text-sm text-muted-foreground">Your Credits:</p>
                <p className="text-xl font-bold text-brand-orange">
                  {userProfile?.credits?.toFixed(2) || '0.00'} C
                </p>
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-brand-orange/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-brand-orange" />
                    </div>
                    <span className="hidden sm:inline">
                      {user.user_metadata?.name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">Welcome!</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="sm:hidden mt-2">
                      <Badge variant="secondary" className="bg-brand-orange/20 text-brand-orange">
                        {userProfile?.credits?.toFixed(2) || '0.00'} Credits
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Admin
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-brand-orange">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.user_metadata?.name || user.email?.split('@')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Choose from our services below to get started.
          </p>
        </div>

        {/* Quick Stats - Mobile Visible */}
        <div className="sm:hidden mb-6">
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold text-brand-orange">
                  {userProfile?.credits?.toFixed(2) || '0.00'} C
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {((userProfile?.credits || 0) * 100).toFixed(0)} MMK
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mainMenuItems.map((item, index) => (
            <Card
              key={index}
              className="bg-gradient-card border-border hover:border-brand-orange/50 transition-all cursor-pointer group"
              onClick={item.onClick}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-brand-orange/20 flex items-center justify-center group-hover:bg-brand-orange/30 transition-colors">
                    <item.icon className="h-6 w-6 text-brand-orange" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Admin Quick Access */}
        {isAdmin && (
          <div className="mt-8">
            <Card className="bg-gradient-primary border-brand-orange">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="h-5 w-5" />
                  Admin Quick Access
                </CardTitle>
                <CardDescription className="text-white/80">
                  Manage your telco credits platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" size="sm">
                    Manage Users
                  </Button>
                  <Button variant="secondary" size="sm">
                    View Orders
                  </Button>
                  <Button variant="secondary" size="sm">
                    Credit Requests
                  </Button>
                  <Button variant="secondary" size="sm">
                    Site Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}