import { Search, ShoppingCart, Plus, Minus, Trash2, Clock, Star } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useSupabaseTable } from "../hooks/useSupabaseTable";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  isVeg: boolean;
  available: boolean;
};

export function Canteen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const { data: menuItems, loading } = useSupabaseTable<MenuItem>(["canteen_menu", "menu_items"], {
    fallbackData: [],
  });
  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category))).filter(Boolean)];

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Canteen Menu</h1>
          <p className="text-muted-foreground mt-1">Order your favorite food online</p>
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
                  <div className="text-5xl">{item.image}</div>
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
                      <div className="text-2xl">{cartItem.item.image}</div>
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
