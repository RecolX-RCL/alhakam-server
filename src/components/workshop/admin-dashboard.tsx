"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Users,
  DollarSign,
  Coins,
  Clock,
  LogOut,
  Search,
  Copy,
  Trash2,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/session";
import { apiGet, apiPost, apiDelete, apiPatch } from "@/lib/api";
import { formatMoney, formatDate, type Currency } from "@/lib/format";

interface CustomerListItem {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  accessCode: string;
  createdAt: string;
  totals: {
    USD: { charges: number; paid: number; remaining: number };
    SYP: { charges: number; paid: number; remaining: number };
    pendingCount: number;
  };
  hasPendingPayments: boolean;
}

interface CustomerDetail {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  accessCode: string;
  createdAt: string;
  charges: Array<{
    id: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    note: string | null;
    createdAt: string;
    confirmedAt: string | null;
  }>;
}

export function AdminDashboard() {
  const admin = useAppStore((s) => s.admin);
  const logout = useAppStore((s) => s.logoutAdmin);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery<{ customers: CustomerListItem[] }>({
    queryKey: ["customers"],
    queryFn: () => apiGet("/api/customers", admin?.token),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const customers = (data?.customers || []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim()) ||
    (c.phone || "").includes(search.trim())
  );

  // Aggregates
  const totals = (data?.customers || []).reduce(
    (acc, c) => {
      acc.usdRemaining += c.totals.USD.remaining;
      acc.sypRemaining += c.totals.SYP.remaining;
      acc.pendingCount += c.totals.pendingCount;
      acc.customerCount += 1;
      return acc;
    },
    { usdRemaining: 0, sypRemaining: 0, pendingCount: 0, customerCount: 0 }
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#1A2530] text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37] text-[#1A2530] flex items-center justify-center font-black">
              AH
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg">لوحة تحكم المدير</h1>
              <p className="text-xs text-stone-300">المنصوري الهكام · مطابع ألمنيوم</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreateCustomerDialog
              open={showCreate}
              onOpenChange={setShowCreate}
              onCreated={() => {
                setShowCreate(false);
                qc.invalidateQueries({ queryKey: ["customers"] });
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#1A2530]/80"
              onClick={() => {
                logout();
                toast({ title: "تم تسجيل الخروج" });
              }}
            >
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 flex-1">
        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="عدد الزبائن"
            value={String(totals.customerCount)}
            icon={<Users className="w-5 h-5" />}
            tone="stone"
          />
          <StatCard
            label="المتبقي بالدولار"
            value={formatMoney(totals.usdRemaining, "USD")}
            icon={<DollarSign className="w-5 h-5" />}
            tone="green"
          />
          <StatCard
            label="المتبقي بالليرة"
            value={formatMoney(totals.sypRemaining, "SYP")}
            icon={<Coins className="w-5 h-5" />}
            tone="amber"
          />
          <StatCard
            label="دفعات بانتظار الموافقة"
            value={String(totals.pendingCount)}
            icon={<Clock className="w-5 h-5" />}
            tone="red"
          />
        </section>

        {/* Customers table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>الزبائن</CardTitle>
              <CardDescription>اضغط على أي زبون لمتابعة فاتورته ودفعاته</CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف"
                className="pr-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-stone-500">جاري التحميل...</div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                لا يوجد زبائن. اضغط "زبون جديد" للبدء.
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-100 sticky top-0">
                    <tr className="text-right">
                      <th className="px-4 py-3 font-medium">الاسم</th>
                      <th className="px-4 py-3 font-medium hidden md:table-cell">الهاتف</th>
                      <th className="px-4 py-3 font-medium">الرمز</th>
                      <th className="px-4 py-3 font-medium">الدولار</th>
                      <th className="px-4 py-3 font-medium hidden sm:table-cell">الليرة</th>
                      <th className="px-4 py-3 font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className="border-t cursor-pointer hover:bg-stone-50 transition"
                      >
                        <td className="px-4 py-3 font-medium">
                          {c.name}
                          {c.hasPendingPayments && (
                            <Badge variant="destructive" className="mr-2 text-[10px]">
                              موافقة بانتظار
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-stone-600" dir="ltr">
                          {c.phone || "—"}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-stone-700">
                          {c.accessCode}
                        </td>
                        <td className="px-4 py-3">
                          <span className={c.totals.USD.remaining > 0 ? "text-red-600 font-bold" : "text-green-600"}>
                            {formatMoney(c.totals.USD.remaining, "USD")}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={c.totals.SYP.remaining > 0 ? "text-red-600 font-bold" : "text-green-600"}>
                            {formatMoney(c.totals.SYP.remaining, "SYP")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {c.totals.USD.remaining === 0 && c.totals.SYP.remaining === 0 ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">مسدد</Badge>
                          ) : (
                            <Badge variant="secondary">له متبقي</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Customer detail sheet */}
      <CustomerDetailSheet
        customerId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

// ---------- Sub-components ----------

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "stone" | "green" | "amber" | "red";
}) {
  const toneClass = {
    stone: "bg-stone-100 text-stone-700",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  }[tone];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 mb-1">{label}</div>
            <div className="text-xl md:text-2xl font-bold">{value}</div>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const admin = useAppStore((s) => s.admin);
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      toast({ title: "الاسم مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const data = await apiPost(
        "/api/customers",
        { name, phone, notes },
        admin?.token
      );
      toast({
        title: "تم إنشاء الزبون",
        description: `الرمز: ${data.customer.accessCode}`,
      });
      setName("");
      setPhone("");
      setNotes("");
      onCreated();
    } catch (err) {
      toast({
        title: "خطأ",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#1A2530]">
          <Plus className="w-4 h-4 ml-2" />
          زبون جديد
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة زبون جديد</DialogTitle>
          <DialogDescription>
            الرمز رح يتولّد تلقائياً (6 أرقام). قدّمه للزبون ليقدر يدخل ويشوف فاتورته ودفعاته من تطبيقو.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">الاسم *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً: أحمد محمد"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="099..."
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثلاً: عنوان الزبون أو تفاصيل إضافية"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomerDetailSheet({
  customerId,
  onClose,
}: {
  customerId: string | null;
  onClose: () => void;
}) {
  const admin = useAppStore((s) => s.admin);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data } = useQuery<{ customer: CustomerDetail }>({
    queryKey: ["customer", customerId],
    queryFn: () => apiGet(`/api/customers/${customerId}`, admin?.token),
    enabled: !!customerId,
    refetchInterval: 5000,
  });

  const c = data?.customer;

  async function copyCode() {
    if (!c) return;
    try {
      await navigator.clipboard.writeText(c.accessCode);
      toast({ title: "تم نسخ الرمز" });
    } catch {
      toast({ title: "تعذّر النسخ", variant: "destructive" });
    }
  }

  const deleteChargeMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/charges/${id}`, admin?.token),
    onSuccess: () => {
      toast({ title: "تم حذف البند" });
      qc.invalidateQueries({ queryKey: ["customer", customerId] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (e: Error) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/payments/${id}`, admin?.token),
    onSuccess: () => {
      toast({ title: "تم حذف الدفعة" });
      qc.invalidateQueries({ queryKey: ["customer", customerId] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (e: Error) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const toggleChargeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/api/charges/${id}`, { status }, admin?.token),
    onSuccess: () => {
      toast({ title: "تم تحديث الحالة" });
      qc.invalidateQueries({ queryKey: ["customer", customerId] });
    },
    onError: (e: Error) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  // Totals
  const usdCharges = c?.charges.filter((x) => x.currency === "USD").reduce((s, x) => s + x.amount, 0) || 0;
  const usdPaid = c?.payments.filter((x) => x.currency === "USD" && x.status === "confirmed").reduce((s, x) => s + x.amount, 0) || 0;
  const sypCharges = c?.charges.filter((x) => x.currency === "SYP").reduce((s, x) => s + x.amount, 0) || 0;
  const sypPaid = c?.payments.filter((x) => x.currency === "SYP" && x.status === "confirmed").reduce((s, x) => s + x.amount, 0) || 0;
  const usdRemaining = usdCharges - usdPaid;
  const sypRemaining = sypCharges - sypPaid;
  const pendingCount = c?.payments.filter((p) => p.status === "pending").length || 0;

  return (
    <Sheet open={!!customerId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto" side="left">
        <SheetHeader className="space-y-3">
          <SheetTitle className="text-2xl">{c?.name || "..."}</SheetTitle>
          <div className="space-y-1 text-sm text-stone-600">
            {c?.phone && <div dir="ltr" className="text-right">{c.phone}</div>}
            {c?.notes && <p className="text-stone-500">{c.notes}</p>}
          </div>
          {/* Access code */}
          <div className="flex items-center justify-between bg-stone-100 rounded-lg p-3 mt-2">
            <div>
              <div className="text-xs text-stone-500 mb-1">رمز دخول الزبون</div>
              <div className="font-mono text-2xl font-bold tracking-[0.3em]">
                {c?.accessCode || "..."}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={copyCode}>
              <Copy className="w-4 h-4 ml-2" />
              نسخ
            </Button>
          </div>
        </SheetHeader>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <SummaryBlock title="الدولار" charges={usdCharges} paid={usdPaid} remaining={usdRemaining} currency="USD" />
          <SummaryBlock title="الليرة السورية" charges={sypCharges} paid={sypPaid} remaining={sypRemaining} currency="SYP" />
        </div>

        {pendingCount > 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
            عندك {pendingCount} دفعة بانتظار موافقة الزبون. الزبون بيقدر يوافق من تطبيقو.
          </div>
        )}

        {/* Charges / Workshops section */}
        <section className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">الورش / الطلبات ({c?.charges.length || 0})</h3>
              <p className="text-xs text-stone-500">كل ورشة طلب مستقل. الزبون يقدر يكون عندو أكثر من ورشة.</p>
            </div>
            <AddChargeDialog customerId={customerId!} />
          </div>
          <div className="space-y-2">
            {c?.charges.length === 0 && (
              <p className="text-sm text-stone-500 text-center py-4">لا يوجد ورش بعد.</p>
            )}
            {c?.charges.map((ch) => (
              <div
                key={ch.id}
                className={`flex items-center justify-between gap-2 border rounded-lg p-3 ${
                  ch.status === "completed" ? "border-green-200 bg-green-50/50" : "border-[#D4AF37]/40 bg-[#F5F1E6]/50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{ch.description}</div>
                  <div className="text-xs text-stone-500 mt-1">
                    {formatDate(ch.createdAt)}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-bold">{formatMoney(ch.amount, ch.currency as Currency)}</div>
                  <Badge
                    variant={ch.status === "completed" ? "default" : "secondary"}
                    className={`cursor-pointer mt-1 ${
                      ch.status === "completed"
                        ? "bg-green-600 hover:bg-green-600 text-white"
                        : "bg-[#D4AF37] hover:bg-[#C5A059] text-[#1A2530]"
                    }`}
                    onClick={() =>
                      toggleChargeStatusMutation.mutate({
                        id: ch.id,
                        status: ch.status === "completed" ? "in_progress" : "completed",
                      })
                    }
                  >
                    {ch.status === "completed" ? "منجز" : "قيد الإنجاز"}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteChargeMutation.mutate(ch.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Payments section */}
        <section className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">الدفعات</h3>
              <p className="text-xs text-stone-500">كل دفعة جديدة بتضل معلقة لحتى يوافق عليها الزبون من تطبيقو.</p>
            </div>
            <AddPaymentDialog customerId={customerId!} />
          </div>
          <div className="space-y-2">
            {c?.payments.length === 0 && (
              <p className="text-sm text-stone-500 text-center py-4">لا يوجد دفعات.</p>
            )}
            {c?.payments.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-2 border rounded-lg p-3 ${
                  p.status === "pending" ? "border-amber-300 bg-amber-50" : "border-green-200 bg-green-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{formatMoney(p.amount, p.currency as Currency)}</div>
                  <div className="text-xs text-stone-500 mt-1">
                    {p.note ? `${p.note} · ` : ""}
                    {formatDate(p.createdAt)}
                  </div>
                </div>
                <Badge
                  variant={p.status === "confirmed" ? "default" : "secondary"}
                  className={p.status === "confirmed" ? "bg-green-600 hover:bg-green-600 text-white" : "bg-amber-500 hover:bg-amber-500 text-white"}
                >
                  {p.status === "confirmed" ? "مؤكدة" : "بانتظار موافقة الزبون"}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deletePaymentMutation.mutate(p.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </SheetContent>
    </Sheet>
  );
}

function SummaryBlock({
  title,
  charges,
  paid,
  remaining,
  currency,
}: {
  title: string;
  charges: number;
  paid: number;
  remaining: number;
  currency: Currency;
}) {
  return (
    <div className="border rounded-lg p-3 space-y-1">
      <div className="text-xs text-stone-500">{title}</div>
      <div className="text-sm flex justify-between">
        <span>الإجمالي</span>
        <span className="font-medium">{formatMoney(charges, currency)}</span>
      </div>
      <div className="text-sm flex justify-between">
        <span>المدفوع</span>
        <span className="font-medium text-green-600">{formatMoney(paid, currency)}</span>
      </div>
      <div className="text-sm flex justify-between border-t pt-1">
        <span className="font-bold">المتبقي</span>
        <span className={`font-bold ${remaining > 0 ? "text-red-600" : "text-green-600"}`}>
          {formatMoney(remaining, currency)}
        </span>
      </div>
    </div>
  );
}

function AddChargeDialog({ customerId }: { customerId: string }) {
  const admin = useAppStore((s) => s.admin);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "SYP">("USD");
  const [status, setStatus] = useState<"in_progress" | "completed">("in_progress");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!description.trim() || !amount) {
      toast({ title: "الوصف والمبلغ مطلوبان", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiPost(
        `/api/customers/${customerId}/charges`,
        { description, amount: Number(amount), currency, status },
        admin?.token
      );
      toast({ title: "تمت إضافة البند" });
      setDescription("");
      setAmount("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["customer", customerId] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err) {
      toast({
        title: "خطأ",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 ml-1" />
          بند
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة فاتورة / بند</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثلاً: شبابيك ألمنيوم، عدد 5"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>العملة</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as "USD" | "SYP")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">دولار ($)</SelectItem>
                  <SelectItem value="SYP">ل.س</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>الحالة</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "in_progress" | "completed")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">قيد الإنجاز</SelectItem>
                <SelectItem value="completed">منجز</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddPaymentDialog({ customerId }: { customerId: string }) {
  const admin = useAppStore((s) => s.admin);
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "SYP">("USD");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!amount) {
      toast({ title: "المبلغ مطلوب", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await apiPost(
        `/api/customers/${customerId}/payments`,
        { amount: Number(amount), currency, note },
        admin?.token
      );
      toast({
        title: "تمت إضافة الدفعة",
        description: "هي الآن بانتظار موافقة الزبون.",
      });
      setAmount("");
      setNote("");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["customer", customerId] });
      qc.invalidateQueries({ queryKey: ["customers"] });
    } catch (err) {
      toast({
        title: "خطأ",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 ml-1" />
          دفعة
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
          <DialogDescription>
            الدفعة بتضل معلقة لحتى يوافق عليها الزبون من تطبيقو، عشان يتثبت الرقم عند الطرفين.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>العملة</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as "USD" | "SYP")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">دولار ($)</SelectItem>
                  <SelectItem value="SYP">ل.س</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>ملاحظة (اختياري)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً: دفعة نقدية"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>إلغاء</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
