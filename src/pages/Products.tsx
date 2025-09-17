import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ShoppingCart, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_mmk: number;
  price_credits: number;
  operator_id: string;
  category_id: string;
  is_active: boolean;
  sort_order: number;
  operators: {
    name: string;
    display_name: string;
    color_scheme: string;
  };
  categories: {
    name: string;
    display_name: string;
    icon: string;
  };
}

interface Category {
  id: string;
  name: string;
  display_name: string;
  icon: string;
}

interface Operator {
  id: string;
  name: string;
  display_name: string;
  color_scheme: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedOperator, setSelectedOperator] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products with operator and category data
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          operators (name, display_name, color_scheme),
          categories (name, display_name, icon)
        `)
        .eq('is_active', true)
        .order('sort_order');

      if (productsError) throw productsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      // Fetch operators
      const { data: operatorsData, error: operatorsError } = await supabase
        .from('operators')
        .select('*')
        .eq('is_active', true);

      if (operatorsError) throw operatorsError;

      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setOperators(operatorsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error loading products",
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "all" || product.categories.name === selectedCategory;
    const operatorMatch = selectedOperator === "all" || product.operators.name === selectedOperator;
    return categoryMatch && operatorMatch;
  });

  const handlePurchase = (product: Product) => {
    toast({
      title: "Coming Soon!",
      description: `Purchase functionality for ${product.name} will be available soon.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-brand-orange border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Browse Products</h1>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} products available
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Category
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.icon} {category.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Operator
                  </label>
                  <Select value={selectedOperator} onValueChange={setSelectedOperator}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Operators" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Operators</SelectItem>
                      {operators.map((operator) => (
                        <SelectItem key={operator.id} value={operator.name}>
                          {operator.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                No products found matching your filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedOperator("all");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-gradient-card border-border hover:border-brand-orange/50 transition-all group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: `${product.operators.color_scheme}20`, color: product.operators.color_scheme }}
                    >
                      {product.operators.display_name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {product.categories.icon} {product.categories.display_name}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-brand-orange transition-colors">
                    {product.name}
                  </CardTitle>
                  {product.description && (
                    <CardDescription className="text-sm">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold text-brand-orange">
                            {product.price_credits.toFixed(1)} C
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ({product.price_mmk.toLocaleString()} MMK)
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handlePurchase(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
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