import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, LogOut, Phone, ShieldCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function Profile() {
  const [_, setLocation] = useLocation();
  
  const phone = localStorage.getItem("tabib_phone") || "+971 50 000 0000";
  const patientId = localStorage.getItem("tabib_patient_id") || "PAT-12345";

  const handleLogout = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    localStorage.removeItem("tabib_token");
    localStorage.removeItem("tabib_patient_id");
    setLocation("/phone");
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-gray-50 pb-[env(safe-area-inset-bottom)]">
      <header className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200 bg-white px-4 z-10">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">الملف الشخصي</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col pb-24">
        <div className="bg-white rounded-lg p-6 w-full flex flex-col items-center text-center mb-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-primary">
            <User className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-extrabold mb-1">المريض</h2>
          
          <div className="w-full flex flex-col gap-3 mt-6">
            <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500 shrink-0" />
              <div className="flex flex-col items-start flex-1">
                <span className="text-xs text-gray-500 font-bold">رقم الهاتف</span>
                <span className="font-bold text-foreground" dir="ltr">{phone}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-100 p-4 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-gray-500 shrink-0" />
              <div className="flex flex-col items-start flex-1">
                <span className="text-xs text-gray-500 font-bold">رقم الملف الطبي</span>
                <span className="font-bold text-foreground font-mono text-sm">{patientId}</span>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleLogout}
          className="w-full min-h-[56px] text-lg font-bold rounded-lg bg-destructive text-white hover:bg-destructive/90 flex items-center justify-center gap-2 mt-auto transition-all duration-200 hover:scale-105"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </Button>
        
        <p className="text-center text-xs text-gray-400 mt-6 font-bold">
          الإصدار 1.0.0
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
