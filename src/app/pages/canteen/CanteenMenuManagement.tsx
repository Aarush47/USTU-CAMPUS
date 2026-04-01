import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Plus, Edit, Trash2, Search, Upload, Star } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { toast } from "sonner";

type MenuItem = {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  isVeg: boolean;
  available: boolean;
  created_at: string;
  updated_at?: string;
};

const CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Snacks",
  "Beverages",
  "Desserts",
  "Main Course",
  "Starters",
];

export function CanteenMenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
    rating: "4.0",
    isVeg: true,
    available: true,
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("canteen_menu")
        .select("*")
        .order("updated_at", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      image: "",
      rating: "4.0",
      isVeg: true,
      available: true,
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    const itemData = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      image: formData.image || "🍽️",
      rating: parseFloat(formData.rating),
      isVeg: formData.isVeg,
      available: formData.available,
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from("canteen_menu")
          .update({ ...itemData, updated_at: new Date().toISOString() })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Menu item updated successfully");
      } else {
        const { error } = await supabase
          .from("canteen_menu")
          .insert([itemData]);

        if (error) throw error;
        toast.success("Menu item added successfully");
      }

      setIsAddDialogOpen(false);
      resetForm();
      fetchMenuItems();
    } catch (error) {
      console.error("Error saving menu item:", error);
      const message = error instanceof Error ? error.message : "Failed to save menu item";
      toast.error(message);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      image: item.image,
      rating: item.rating.toString(),
      isVeg: item.isVeg,
      available: item.available,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const { error } = await supabase
        .from("canteen_menu")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Menu item deleted successfully");
      fetchMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      const message = error instanceof Error ? error.message : "Failed to delete menu item";
      toast.error(message);
    }
  };

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("canteen_menu")
          .update({ available: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Item ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      fetchMenuItems();
    } catch (error) {
      console.error("Error updating availability:", error);
      const message = error instanceof Error ? error.message : "Failed to update item availability";
      toast.error(message);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Menu Management</h1>
          <p className="text-muted-foreground mt-1">Add, edit, and manage your canteen menu items</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVeg"
                  checked={formData.isVeg}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVeg: checked })}
                />
                <Label htmlFor="isVeg">Vegetarian</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Available</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingItem ? "Update Item" : "Add Item"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-4 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.category}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold text-primary">₹{item.price}</span>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{item.rating}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {item.isVeg ? 'Veg' : 'Non-Veg'}
                </span>
              </div>
              <Button
                size="sm"
                variant={item.available ? "default" : "secondary"}
                onClick={() => toggleAvailability(item.id, item.available)}
              >
                {item.available ? "Available" : "Unavailable"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No menu items found</p>
        </div>
      )}
    </div>
  );
}