import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { DollarSign, Calendar, CheckCircle, Clock, Download, CreditCard, AlertCircle } from "lucide-react";
import { Badge } from "./ui/badge";

const feeStructure = [
  { category: "Tuition Fee", amount: 45000, status: "Paid", date: "2025-08-15" },
  { category: "Library Fee", amount: 2000, status: "Paid", date: "2025-08-15" },
  { category: "Laboratory Fee", amount: 5000, status: "Paid", date: "2025-08-15" },
  { category: "Sports Fee", amount: 1500, status: "Paid", date: "2025-08-15" },
  { category: "Development Fee", amount: 3000, status: "Paid", date: "2025-08-15" },
  { category: "Examination Fee", amount: 2500, status: "Pending", date: "-" },
  { category: "Hostel Fee (Semester 6)", amount: 15000, status: "Pending", date: "-" },
  { category: "Mess Fee (February)", amount: 4500, status: "Pending", date: "-" },
];

const paymentHistory = [
  {
    id: "TXN20250815001",
    description: "Semester 5 Fees Payment",
    amount: 56500,
    date: "2025-08-15",
    method: "UPI",
    status: "Success",
  },
  {
    id: "TXN20250201001",
    description: "Hostel & Mess Fee - January",
    amount: 19500,
    date: "2025-02-01",
    method: "Net Banking",
    status: "Success",
  },
  {
    id: "TXN20250101001",
    description: "Mess Fee - December",
    amount: 4500,
    date: "2025-01-01",
    method: "Credit Card",
    status: "Success",
  },
];

export function Fees() {
  const totalPaid = feeStructure
    .filter((fee) => fee.status === "Paid")
    .reduce((sum, fee) => sum + fee.amount, 0);

  const totalPending = feeStructure
    .filter((fee) => fee.status === "Pending")
    .reduce((sum, fee) => sum + fee.amount, 0);

  const totalFees = feeStructure.reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Fee Management</h1>
        <p className="text-muted-foreground mt-1">View and manage your fee payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Fees</p>
              <h3 className="text-2xl font-semibold text-foreground mt-2">₹{totalFees.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Amount Paid</p>
              <h3 className="text-2xl font-semibold text-emerald-600 mt-2">₹{totalPaid.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Amount</p>
              <h3 className="text-2xl font-semibold text-amber-600 mt-2">₹{totalPending.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-primary bg-accent">
          <div className="text-center">
            <CreditCard className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Quick Payment</p>
            <Button className="w-full">Pay Now</Button>
          </div>
        </Card>
      </div>

      {/* Fee Structure */}
      <Card className="p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Fee Structure - Semester 6</h2>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
        </div>

        <div className="space-y-3">
          {feeStructure.map((fee, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-secondary rounded-lg border border-border"
            >
              <div className="flex items-center gap-3">
                {fee.status === "Paid" ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
                <div>
                  <h4 className="font-medium text-foreground">{fee.category}</h4>
                  {fee.date !== "-" && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Paid on: {new Date(fee.date).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-semibold text-foreground">₹{fee.amount.toLocaleString()}</span>
                <Badge
                  variant={fee.status === "Paid" ? "default" : "secondary"}
                  className={
                    fee.status === "Paid"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  }
                >
                  {fee.status}
                </Badge>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary mt-4">
            <h4 className="font-semibold text-foreground">Total</h4>
            <span className="text-xl font-bold text-primary">₹{totalFees.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="p-6 border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Payment History</h2>
        <div className="space-y-3">
          {paymentHistory.map((payment) => (
            <div
              key={payment.id}
              className="flex items-start justify-between p-4 bg-secondary rounded-lg border border-border hover:border-primary transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-foreground">{payment.description}</h4>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">{payment.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(payment.date).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{payment.method}</span>
                  </div>
                  <span className="text-xs">Transaction ID: {payment.id}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-semibold text-foreground">₹{payment.amount.toLocaleString()}</span>
                <Button variant="outline" size="sm">
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Receipt
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-6 border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Payment Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-6 bg-secondary rounded-lg border border-border hover:border-primary hover:bg-accent transition-all text-center">
            <CreditCard className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-medium text-foreground">Credit/Debit Card</h4>
            <p className="text-sm text-muted-foreground mt-1">Pay using your card</p>
          </button>
          <button className="p-6 bg-secondary rounded-lg border border-border hover:border-primary hover:bg-accent transition-all text-center">
            <DollarSign className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-medium text-foreground">UPI Payment</h4>
            <p className="text-sm text-muted-foreground mt-1">Pay via UPI apps</p>
          </button>
          <button className="p-6 bg-secondary rounded-lg border border-border hover:border-primary hover:bg-accent transition-all text-center">
            <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-medium text-foreground">Net Banking</h4>
            <p className="text-sm text-muted-foreground mt-1">Pay through your bank</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
