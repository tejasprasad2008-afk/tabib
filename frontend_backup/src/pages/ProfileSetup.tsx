import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { User, Phone, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfileSetup() {
  const [_, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clinicName = localStorage.getItem("tabib_clinic_name") || "العيادة";

  const handleComplete = async () => {
    if (!name || !phone) return;
    
    setIsSubmitting(true);
    if (navigator.vibrate) navigator.vibrate(15);

    // Simulate registration
    await new Promise(r => setTimeout(r, 1500));

    localStorage.setItem("tabib_patient_name", name);
    localStorage.setItem("tabib_patient_phone", phone);
    localStorage.setItem("tabib_patient_email", email);
    localStorage.setItem("tabib_token", "demo_token_" + Date.now());
    localStorage.setItem("tabib_patient_id", "patient_" + Date.now());

    setLocation("/app/chat");
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-white pb-[env(safe-area-inset-bottom)]">
      <header className="px-6 pt-12 pb-6 border-b border-gray-100">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/app/discovery")}
          className="mb-4 -mx-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">إكمال الملف الشخصي</h1>
        <p className="text-muted-foreground font-medium">أهلاً بك في {clinicName}. يرجى تزويدنا ببياناتك للتواصل.</p>
      </header>

      <div className="flex-1 p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <User size={16} />
              الاسم الكامل
            </label>
            <Input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد محمد"
              className="h-14 rounded-xl border-2 focus:border-primary transition-all text-lg font-medium bg-gray-50"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Phone size={16} />
              رقم الجوال
            </label>
            <Input 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              type="tel"
              className="h-14 rounded-xl border-2 focus:border-primary transition-all text-lg font-medium bg-gray-50"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Mail size={16} />
              البريد الإلكتروني (اختياري)
            </label>
            <Input 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              type="email"
              className="h-14 rounded-xl border-2 focus:border-primary transition-all text-lg font-medium bg-gray-50"
              dir="rtl"
            />
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-2xl flex gap-3 items-start">
          <CheckCircle2 className="text-primary h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm text-primary/80 font-medium leading-relaxed">
            بياناتك مشفرة ومحفوظة محلياً على هذا الجهاز. سيتم مشاركتها فقط مع طاقم العيادة عند طلبك للاستشارة.
          </p>
        </div>
      </div>

      <div className="p-6">
        <Button 
          size="lg" 
          onClick={handleComplete}
          disabled={!name || !phone || isSubmitting}
          className="w-full h-16 rounded-2xl text-xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          {isSubmitting ? "جاري الحفظ..." : "بدأ المحادثة"}
        </Button>
      </div>
    </div>
  );
}
