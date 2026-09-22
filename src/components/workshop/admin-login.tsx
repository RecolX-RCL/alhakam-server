"use client";

import { useState } from "react";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/lib/session";
import { apiPost } from "@/lib/api";

interface Props {
  onBack: () => void;
}

export function AdminLogin({ onBack }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const setAdmin = useAppStore((s) => s.setAdmin);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiPost("/api/admin/login", { password });
      setAdmin({ role: "admin", token: data.token });
      toast({ title: "تم الدخول بنجاح", variant: "default" });
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
            <div className="mx-auto w-12 h-12 rounded-xl bg-stone-800 text-stone-50 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <CardTitle>دخول المدير</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "جاري الدخول..." : "دخول"}
              </Button>
              <p className="text-xs text-stone-500 text-center">
                كلمة المرور الافتراضية: admin123
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
