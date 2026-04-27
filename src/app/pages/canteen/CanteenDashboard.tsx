import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Utensils, TrendingUp, Users, DollarSign, Clock, Star } from "lucide-react";
import { supabase } from "../../lib/supabase";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  isVeg: boolean;
  available: boolean;
};

type CanteenOrder = {
  id: number;
  token_number: number;
  customer_name: string | null;
  total: number;
  status: string;
  created_at: string;
  items: Array<{ id: number; name: string; price: number; quantity: number }>;
};

export function CanteenDashboard() {
  const { user } = useUser();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<CanteenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    totalRevenue: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      setLoading(true);

      try {
        const { data: items, error } = await supabase
          .from("canteen_menu")
          .select("*")
          .order("created_at", { ascending: false });

        const { data: orderRows, error: orderError } = await supabase
          .from("canteen_orders")
          .select("id, token_number, customer_name, total, status, created_at, items")
          .order("token_number", { ascending: false })
          .limit(10);

        if (error) throw error;
        if (orderError) throw orderError;

        setMenuItems(items || []);
        setOrders(orderRows || []);

        // Calculate stats
        const totalItems = items?.length || 0;
        const availableItems = items?.filter(item => item.available).length || 0;
        const avgRating = totalItems > 0
          ? items.reduce((sum, item) => sum + item.rating, 0) / totalItems
          : 0;

        setStats({
          totalItems,
          availableItems,
          totalRevenue: 0, // This would need order history data
          avgRating: Number(avgRating.toFixed(1)),
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    const channel = supabase
      .channel("canteen-orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "canteen_orders" },
        () => {
          void fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const recentItems = menuItems.slice(0, 5);
  const activeOrders = orders.filter((order) => order.status !== "completed" && order.status !== "cancelled");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Canteen Dashboard</h1>
        <p className="text-muted-foreground">Manage your menu and track performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Menu Items</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">{stats.totalItems}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Items</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">{stats.availableItems}</h3>
            </div>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">
                {stats.avgRating}/5.0
              </h3>
            </div>
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">₹0</h3>
            </div>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Menu Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Menu Items</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">₹{item.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.available
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            ))}
            {recentItems.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No menu items yet</p>
            )}
          </div>
        </Card>

        <Card className="p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Utensils className="w-4 h-4 mr-2" />
              Add New Menu Item
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Sales Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Update Opening Hours
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Manage Staff
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live Order Queue</h2>
            <p className="text-sm text-muted-foreground">Tokens from student orders appear here in real time.</p>
          </div>
          <span className="text-sm text-muted-foreground">
            {activeOrders.length} active order{activeOrders.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-accent/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Token</p>
                  <h3 className="text-2xl font-semibold text-foreground">#{order.token_number}</h3>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "preparing"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "ready"
                    ? "bg-green-100 text-green-800"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground font-medium">{order.customer_name || "Student order"}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {order.items.reduce((count, item) => count + item.quantity, 0)} item{order.items.length === 1 ? "" : "s"}
              </p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-primary">₹{Number(order.total).toFixed(0)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Placed {new Date(order.created_at).toLocaleTimeString()}</p>
            </div>
          ))}

          {activeOrders.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center md:col-span-2 xl:col-span-3">
              <p className="text-sm text-muted-foreground">No active tokens right now.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}