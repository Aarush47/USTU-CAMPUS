import { Search, ShoppingCart, Plus, Minus, Trash2, Clock, Star, Lock } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  isVeg: boolean;
  available: boolean;
  created_at?: string;
  updated_at?: string;
};

export function Canteen() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [hasCanteenAccess, setHasCanteenAccess] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuUpdatedAt, setMenuUpdatedAt] = useState<string | null>(null);
  const [brokenImageIds, setBrokenImageIds] = useState<Set<number>>(new Set());

  const isImageUrl = (value: string) => value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("canteen_menu")
        .select("*")
        .eq("available", true)
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching canteen menu:", error);
        setMenuItems([]);
        setMenuUpdatedAt(null);
      } else {
        const items = data ?? [];
        setMenuItems(items);
        const latest = items[0];
        setMenuUpdatedAt((latest?.updated_at ?? latest?.created_at) || null);
      }

      setLoading(false);
    };

    void fetchMenu();

    const channel = supabase
      .channel("canteen-menu-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "canteen_menu" },
        () => {
          void fetchMenu();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category))).filter(Boolean)];

  // Check canteen access
  useEffect(() => {
    const checkCanteenAccess = async () => {
      if (!user?.id) {
        setCheckingAccess(false);
        return;
      }

      try {
        const email = (user.primaryEmailAddress?.emailAddress || "").trim().toLowerCase();

        const { data, error } = await supabase
          .from("users")
          .select("canteen_access")
          .or(`clerk_user_id.eq.${user.id},email.ilike.${email}`)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error checking canteen access:", error);
          setHasCanteenAccess(false);
        } else {
          setHasCanteenAccess(data?.canteen_access ?? true); // Default to true for backward compatibility
        }
      } catch (error) {
        console.error("Error checking canteen access:", error);
        setHasCanteenAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkCanteenAccess();
  }, [user]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find((cartItem) => cartItem.item.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: number) => {
    const existingItem = cart.find((cartItem) => cartItem.item.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(
        cart.map((cartItem) =>
          cartItem.item.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      );
    } else {
      setCart(cart.filter((cartItem) => cartItem.item.id !== itemId));
    }
  };

  const deleteFromCart = (itemId: number) => {
    setCart(cart.filter((cartItem) => cartItem.item.id !== itemId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
  };

  // Show loading while checking access
  if (checkingAccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show access denied if no canteen access
  if (hasCanteenAccess === false) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Canteen Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            Your canteen access has been disabled. Please contact your teacher or administrator to enable access.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Canteen Menu</h1>
          <p className="text-muted-foreground mt-1">Order your favorite food online</p>
          {menuUpdatedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Latest menu update: {new Date(menuUpdatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Open: 8:00 AM - 8:00 PM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for food items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading && <p className="text-sm text-muted-foreground">Loading menu from Supabase...</p>}
            {filteredItems.map((item) => (
              <Card key={item.id} className={`p-4 ${!item.available ? "opacity-60" : ""}`}>
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                    {isImageUrl(item.image) && !brokenImageIds.has(item.id) ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={() =>
                          setBrokenImageIds((prev) => {
                            const next = new Set(prev);
                            next.add(item.id);
                            return next;
                          })
                        }
                      />
                    ) : (
                      <span className="text-3xl">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        item.isVeg ? "border-green-500" : "border-red-500"
                      }`} />
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-semibold text-primary">₹{item.price}</span>
                      {item.available ? (
                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      ) : (
                        <span className="text-sm text-destructive font-medium">Not Available</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No items found</p>
            </Card>
          )}
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Your Order</h2>
              {getTotalItems() > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                  {getTotalItems()}
                </span>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Add items to get started!</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                  {cart.map((cartItem) => (
                    <div key={cartItem.item.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      <div className="w-10 h-10 rounded-md bg-background flex items-center justify-center overflow-hidden">
                        {isImageUrl(cartItem.item.image) && !brokenImageIds.has(cartItem.item.id) ? (
                          <img
                            src={cartItem.item.image}
                            alt={cartItem.item.name}
                            className="w-full h-full object-cover"
                            onError={() =>
                              setBrokenImageIds((prev) => {
                                const next = new Set(prev);
                                next.add(cartItem.item.id);
                                return next;
                              })
                            }
                          />
                        ) : (
                          <span className="text-lg">🍽️</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{cartItem.item.name}</p>
                        <p className="text-sm text-primary font-semibold">₹{cartItem.item.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => removeFromCart(cartItem.item.id)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center font-medium">{cartItem.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => addToCart(cartItem.item)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteFromCart(cartItem.item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (5%)</span>
                    <span className="font-medium">₹{Math.round(getTotalPrice() * 0.05)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{Math.round(getTotalPrice() * 1.05)}</span>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  Place Order
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
