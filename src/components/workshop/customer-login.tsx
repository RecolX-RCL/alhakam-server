"use client";

import { useState } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/session";
import { apiPost } from "@/lib/api";

interface Props {
  onBack: () => void;
}

export function CustomerLogin({ onBack }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const setCustomer = useAppStore((s) => s.setCustomer);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiPost("/api/customer/login", { accessCode: code.trim() });
      setCustomer({
        role: "customer",
        customerId: data.customer.id,
        accessCode: data.customer.accessCode,
      });
      toast({ title: `أهلاً ${data.customer.name}`, variant: "default" });
    } catch (err) {
      toast({
        title: "خطأ بالدخول",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowRight className="w-4 h-4 ml-2" />
          رجوع
        </Button>
        <Card>
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
            <CardTitle>دخول الزبون</CardTitle>
            <CardDescription>
              أدخل الرمز اللي عطاك ياه صاحب الورشة (6 أرقام)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">رمز الدخول</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  pattern="\d*"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={8}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري التحقق..." : "دخول"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
