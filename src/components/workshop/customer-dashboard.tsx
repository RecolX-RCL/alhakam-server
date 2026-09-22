"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  Check,
  Clock,
  DollarSign,
  Coins,
  TrendingDown,
  Receipt,
  CheckCircle2,
  Phone,
  Info,
  AlertCircle,
  Wrench,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/session";
import { apiGet, apiPost } from "@/lib/api";
import { formatMoney, formatDate, type Currency } from "@/lib/format";

interface CustomerData {
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

export function CustomerDashboard() {
  const customer = useAppStore((s) => s.customer);
  const logout = useAppStore((s) => s.logoutCustomer);
  const qc = useQueryClient();
  const { toast } = useToast();

  // Track previous pending payment ids so we can detect NEW ones arriving
  const prevPendingIdsRef = useRef<Set<string>>(new Set());
  const firstLoadRef = useRef(true);

  const { data } = useQuery<{ customer: CustomerData }>({
    queryKey: ["customer-session", customer?.customerId],
    queryFn: () =>
      apiGet(
        `/api/customer/session/${customer?.customerId}?code=${customer?.accessCode}`
      ),
    enabled: !!customer,
    refetchInterval: 3000,
    refetchIntervalInBackground: true, // keep polling even when tab is in background
  });

  // Detect new pending payments arriving → fire a toast
  useEffect(() => {
    if (!data?.customer) return;
    const currentPending = data.customer.payments.filter((p) => p.status === "pending");
    const currentIds = new Set(currentPending.map((p) => p.id));

    if (firstLoadRef.current) {
      // Don't notify for already-existing pending payments on first load
      prevPendingIdsRef.current = currentIds;
      firstLoadRef.current = false;
      return;
    }

    // Find ids that are new (in current, not in previous)
    const newPending = currentPending.filter(
      (p) => !prevPendingIdsRef.current.has(p.id)
    );
    if (newPending.length > 0) {
      newPending.forEach((p) => {
        toast({
          title: "🔔 دفعة جديدة بانتظار موافقتك",
          description: `${formatMoney(p.amount, p.currency as Currency)} — اضغط "موافق" لتأكيد التثبيت.`,
          variant: "default",
        });
      });
      prevPendingIdsRef.current = currentIds;
    } else if (currentIds.size !== prevPendingIdsRef.current.size) {
      // Some pending payment got confirmed/removed → update ref
      prevPendingIdsRef.current = currentIds;
    }
  }, [data?.customer, toast]);

  const confirmMutation = useMutation({
    mutationFn: (paymentId: string) =>
      apiPost(`/api/payments/${paymentId}/confirm`, {
        accessCode: customer?.accessCode,
      }),
    onSuccess: () => {
      toast({ title: "✓ تم تأكيد الدفعة", description: "تم تحديث رصيدك بنجاح." });
      qc.invalidateQueries({ queryKey: ["customer-session", customer?.customerId] });
    },
    onError: (e: Error) =>
      toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const c = data?.customer;
  if (!c) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        جاري التحميل...
      </div>
    );
  }

  // Per-currency totals (across ALL workshops/orders)
  const usdCharges = c.charges.filter((x) => x.currency === "USD").reduce((s, x) => s + x.amount, 0);
  const usdPaid = c.payments.filter((x) => x.currency === "USD" && x.status === "confirmed").reduce((s, x) => s + x.amount, 0);
  const sypCharges = c.charges.filter((x) => x.currency === "SYP").reduce((s, x) => s + x.amount, 0);
  const sypPaid = c.payments.filter((x) => x.currency === "SYP" && x.status === "confirmed").reduce((s, x) => s + x.amount, 0);
  const usdRemaining = usdCharges - usdPaid;
  const sypRemaining = sypCharges - sypPaid;
  const pendingPayments = c.payments.filter((p) => p.status === "pending");

  // Group charges as "ورش" (workshops/orders) — each charge is its own job
  const workshops = c.charges;

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
              <h1 className="font-bold text-base md:text-lg">أهلاً، {c.name}</h1>
              <p className="text-xs text-stone-300">المنصوري الهكام · فاتورتك</p>
            </div>
          </div>
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
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 flex-1">
        {/* Welcome / explanation banner */}
        <div className="bg-[#F5F1E6] border border-[#D4AF37]/40 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#1A2530] space-y-1">
            <p className="font-bold">مرحباً بك في صفحتك الخاصة</p>
            <p className="text-[#1A2530]/80">
              هنا بتشوف كل طلباتك (ورشاتك) مع صاحب الورشة، وكل الدفعات التي سجّلها لك.
              إذا سجّل دفعة جديدة بتظهر عندك فوراً ضمن قائمة <span className="font-bold">"دفعات بانتظار موافقتك"</span> — اضغط "موافق" لتثبيتها وتحديث رصيدك المتبقي.
            </p>
          </div>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="إجمالي فواتير بالدولار"
            value={formatMoney(usdCharges, "USD")}
            icon={<DollarSign className="w-5 h-5" />}
            tone="stone"
          />
          <StatCard
            label="متبقي بالدولار"
            value={formatMoney(usdRemaining, "USD")}
            icon={<TrendingDown className="w-5 h-5" />}
            tone={usdRemaining > 0 ? "red" : "green"}
          />
          <StatCard
            label="إجمالي فواتير بالليرة"
            value={formatMoney(sypCharges, "SYP")}
            icon={<Coins className="w-5 h-5" />}
            tone="stone"
          />
          <StatCard
            label="متبقي بالليرة"
            value={formatMoney(sypRemaining, "SYP")}
            icon={<TrendingDown className="w-5 h-5" />}
            tone={sypRemaining > 0 ? "red" : "green"}
          />
        </section>

        {/* Pending payments — most important action */}
        {pendingPayments.length > 0 && (
          <Card className="border-[#D4AF37] bg-[#F5F1E6]">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-[#1A2530]">
                <Clock className="w-5 h-5 text-[#D4AF37]" />
                دفعات جديدة بانتظار موافقتك ({pendingPayments.length})
              </CardTitle>
              <p className="text-sm text-[#1A2530]/70">
                صاحب الورشة سجّل دفعات جديدة. اضغط "موافق" لتثبيت المبلغ عندك. الموافقة تعني تأكيدك أنك دفعت هذا المبلغ.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 bg-white border border-[#D4AF37]/50 rounded-lg p-3"
                >
                  <div>
                    <div className="font-bold text-lg">
                      {formatMoney(p.amount, p.currency as Currency)}
                    </div>
                    {p.note && <div className="text-xs text-stone-500 mt-1">{p.note}</div>}
                    <div className="text-xs text-stone-500 mt-1">
                      <Calendar className="w-3 h-3 inline ml-1" />
                      {formatDate(p.createdAt)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#1A2530]"
                    disabled={confirmMutation.isPending}
                    onClick={() => confirmMutation.mutate(p.id)}
                  >
                    <Check className="w-4 h-4 ml-2" />
                    موافق
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Workshops / orders (multiple) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-[#1A2530] flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#D4AF37]" />
              طلباتي / ورشاتي ({workshops.length})
            </h2>
          </div>
          <p className="text-sm text-stone-600 mb-4">
            كل ورشة عبارة عن طلب مستقل (شبابيك، باب، مطبخ...) مع حالتها. قد يكون لك أكثر من ورشة لدى الورشة.
          </p>

          {workshops.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-stone-500">
                لا يوجد طلبات مسجلة حالياً.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {workshops.map((w) => (
                <Card key={w.id} className="overflow-hidden">
                  <div className={`h-1 ${w.status === "completed" ? "bg-green-600" : "bg-[#D4AF37]"}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base">{w.description}</CardTitle>
                        <p className="text-xs text-stone-500 mt-1">
                          <Calendar className="w-3 h-3 inline ml-1" />
                          {formatDate(w.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={w.status === "completed" ? "default" : "secondary"}
                        className={
                          w.status === "completed"
                            ? "bg-green-600 hover:bg-green-600 text-white"
                            : "bg-[#D4AF37] hover:bg-[#C5A059] text-[#1A2530]"
                        }
                      >
                        {w.status === "completed" ? "منجز" : "قيد الإنجاز"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-stone-500">السعر</span>
                      <span className="text-lg font-bold">{formatMoney(w.amount, w.currency as Currency)}</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-2 pt-2 border-t">
                      إجمالي المدفوع والمتبقي مذكور في البطاقات بالأعلى (عبر كل الورش).
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Payment history */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              سجل الدفعات الكامل
            </CardTitle>
            <p className="text-xs text-stone-500">
              كل الدفعات التي سجّلها صاحب الورشة لحسابك. الدفعة "مؤكدة" تعني أنك وافقت عليها.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {c.payments.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-4">
                ما في دفعات مسجلة حالياً.
              </p>
            ) : (
              c.payments.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between gap-2 border rounded-lg p-3 ${
                    p.status === "pending"
                      ? "border-[#D4AF37]/50 bg-[#F5F1E6]"
                      : "border-green-200 bg-green-50"
                  }`}
                >
                  <div>
                    <div className="font-bold">{formatMoney(p.amount, p.currency as Currency)}</div>
                    <div className="text-xs text-stone-500 mt-1">
                      {p.note ? `${p.note} · ` : ""}
                      {formatDate(p.createdAt)}
                    </div>
                  </div>
                  <Badge
                    variant={p.status === "confirmed" ? "default" : "secondary"}
                    className={
                      p.status === "confirmed"
                        ? "bg-green-600 hover:bg-green-600 text-white"
                        : "bg-[#D4AF37] hover:bg-[#C5A059] text-[#1A2530]"
                    }
                  >
                    {p.status === "confirmed" ? "مؤكدة" : "بانتظار موافقتك"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Help / FAQ */}
        <Card className="bg-stone-100 border-stone-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="w-5 h-5 text-stone-600" />
              معلومات وحلول أسئلة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-stone-700">
            <div>
              <div className="font-bold mb-1">كيف يتم حساب المتبقي؟</div>
              <p>المتبقي = إجمالي الفواتير − إجمالي الدفعات المؤكدة فقط. الدفعات المعلقة لا تُحسب حتى توافق عليها.</p>
            </div>
            <div>
              <div className="font-bold mb-1">ماذا تعني "بانتظار موافقتك"؟</div>
              <p>عندما يسجّل صاحب الورشة دفعة جديدة، تبقى معلقة حتى تضغط "موافق" من جهازك. هذا يضمن أن الرقم متطابق عند الطرفين.</p>
            </div>
            <div>
              <div className="font-bold mb-1">ماذا يحدث إذا لم تظهر فاتورة أو دفعة؟</div>
              <p>تواصل مباشرة مع صاحب الورشة على الرقم المذكور في الأسفل. قد يكون هناك تأخير بسيط في التحديث.</p>
            </div>
          </CardContent>
        </Card>

        {/* Workshop contact */}
        <Card className="bg-[#1A2530] text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-stone-300 mb-1">للاستفسار والتواصل</div>
                <div className="font-bold text-lg">المنصوري الهكام</div>
                <div className="text-sm text-[#D4AF37]">مطابع ألمنيوم</div>
              </div>
              <a
                href="tel:0543837989"
                className="flex items-center gap-2 bg-[#D4AF37] text-[#1A2530] rounded-lg px-4 py-2 font-bold hover:bg-[#C5A059] transition"
              >
                <Phone className="w-4 h-4" />
                <span dir="ltr">0543837989</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-auto py-4 text-center text-xs text-stone-500">
        © المنصوري الهكام · جميع الحقوق محفوظة
      </footer>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "stone" | "green" | "red";
}) {
  const toneClass = {
    stone: "bg-stone-100 text-stone-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  }[tone];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 mb-1">{label}</div>
            <div className="text-base md:text-lg font-bold">{value}</div>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${toneClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
