"use client";

import { UserRound, ShieldCheck, Phone } from "lucide-react";

type View = "marketing" | "admin-login" | "customer-login";

export function MarketingLanding({ onPick }: { onPick: (v: View) => void }) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(212,175,55,0.25), transparent 55%), radial-gradient(circle at 80% 80%, rgba(26,37,48,0.35), transparent 55%), #f5f1e6",
      }}
    >
      {/* Card */}
      <div className="w-full max-w-5xl bg-[#F5F1E6] rounded-[20px] shadow-2xl overflow-hidden border border-[#D4AF37]/30">
        {/* Header split */}
        <header className="grid md:grid-cols-2">
          {/* Gold quadrant with aluminum profile */}
          <div className="relative h-32 md:h-44 overflow-hidden" style={{ background: "linear-gradient(135deg, #D4AF37 0%, #C5A059 100%)" }}>
            <div className="absolute inset-0 opacity-30">
              <img
                src="/landing/aluminum-profile.jpg"
                alt="بروفايل ألمنيوم"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <LogoMark />
            </div>
          </div>
          {/* Cream quadrant with headline */}
          <div className="p-6 md:p-10 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1A2530] leading-tight">
              المنصوري الهكام
            </h1>
            <p className="text-base md:text-lg text-[#C5A059] font-medium mt-1">
              مطابع ألمنيوم
            </p>
            <p className="text-sm md:text-base text-[#1A2530]/80 mt-3 leading-relaxed">
              أهلاً بك في المنصوري الهكام، نرحب بكم في عالم المطابع والألمنيوم.
            </p>
          </div>
        </header>

        {/* Body grid */}
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: kitchen photos */}
          <div className="p-4 md:p-6 space-y-3">
            <img
              src="/landing/kitchen-1.jpg"
              alt="مطبخ عصري"
              className="w-full h-44 md:h-56 object-cover rounded-xl"
            />
            <img
              src="/landing/kitchen-2.jpg"
              alt="مطبخ كلاسيكي"
              className="w-full h-44 md:h-56 object-cover rounded-xl"
            />
            {/* Phone CTA */}
            <a
              href="tel:0543837989"
              className="flex items-center justify-center gap-2 w-full mt-2 bg-[#1A2530] text-white rounded-lg py-3 font-bold hover:bg-[#1A2530]/90 transition"
            >
              <Phone className="w-5 h-5" />
              <span>تواصل معنا مباشرة</span>
              <span dir="ltr" className="font-mono">0543837989</span>
            </a>
          </div>

          {/* Right: services + entry buttons */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-[#1A2530] mb-4">
                خدماتنا
              </h2>
              <ul className="space-y-3">
                {[
                  "مطابخ عصرية متكاملة",
                  "شبابيك وأبواب ألمنيوم",
                  "واجهات معاصر وموبيليا",
                  "تصاميم وتنفيذ احترافي",
                ].map((s) => (
                  <li key={s} className="flex items-center gap-2 text-[#1A2530]">
                    <span className="w-6 h-px bg-[#D4AF37]" />
                    <span className="text-sm md:text-base">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entry buttons */}
            <div className="mt-6 space-y-3">
              <div className="text-xs text-[#1A2530]/70 text-center mb-2">
                للدخول إلى حسابك، اختر:
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onPick("admin-login")}
                  className="flex flex-col items-center gap-1 bg-[#1A2530] text-white rounded-lg py-3 px-2 hover:bg-[#1A2530]/90 transition"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-bold">دخول المدير</span>
                </button>
                <button
                  onClick={() => onPick("customer-login")}
                  className="flex flex-col items-center gap-1 bg-[#D4AF37] text-[#1A2530] rounded-lg py-3 px-2 hover:bg-[#C5A059] transition"
                >
                  <UserRound className="w-5 h-5" />
                  <span className="text-sm font-bold">دخول الزبون</span>
                </button>
              </div>
              <p className="text-[10px] text-[#1A2530]/60 text-center mt-2">
                كل زر يفتح تطبيق مستقل يمكنك إضافته لأيقونة جوالك لاحقاً.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-3 text-xs text-[#1A2530]/60 border-t border-[#D4AF37]/20">
          © المنصوري الهكام · مطابع ألمنيوم · جميع الحقوق محفوظة
        </footer>
      </div>
    </main>
  );
}

function LogoMark() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-4xl md:text-5xl font-black text-[#1A2530]">A</span>
      <span className="text-4xl md:text-5xl font-black text-white drop-shadow">H</span>
    </div>
  );
}
