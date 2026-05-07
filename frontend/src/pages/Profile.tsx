import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { User, LogOut, Phone, ShieldCheck, Hospital, Edit2, Ruler, Scale } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface ProfileData {
  profile_completed: boolean;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
}

export default function Profile() {
  const [_, setLocation] = useLocation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  
  const phone = localStorage.getItem("tabib_phone") || "+971 50 000 0000";
  const patientId = localStorage.getItem("tabib_patient_id") || "PAT-12345";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest<ProfileData>("/api/patient/profile");
        setProfile(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    localStorage.removeItem("tabib_token");
    localStorage.removeItem("tabib_patient_id");
    localStorage.removeItem("tabib_profile_completed");
    setLocation("/phone");
  };

  const genderLabel = (g?: string) => {
    if (g === "male") return "ذكر";
    if (g === "female") return "أنثى";
    if (g === "other") return "آخر";
    return "-";
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

            {/* Demographics - only show if profile is completed */}
            {profile?.profile_completed && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-gray-500 font-bold">العمر</span>
                      <span className="font-bold text-foreground">{profile.age} سنة</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-gray-500 font-bold">الجنس</span>
                      <span className="font-bold text-foreground">{genderLabel(profile.gender)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                    <Ruler className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-gray-500 font-bold">الطول</span>
                      <span className="font-bold text-foreground">{profile.height_cm} سم</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                    <Scale className="w-4 h-4 text-gray-500" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-gray-500 font-bold">الوزن</span>
                      <span className="font-bold text-foreground">{profile.weight_kg} كجم</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/profile-setup")}
                  className="w-full mt-3 text-primary font-bold flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  تعديل البيانات الصحية
                </Button>
              </div>
            )}
          </div>
          
          <div className="w-full mt-6 pt-6 border-t border-gray-100">
            <Button 
              variant="outline"
              className="w-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 font-bold h-12 rounded-xl flex items-center justify-center gap-2"
              onClick={() => {
                const url = localStorage.getItem("selectedClinicUrl") || "http://localhost:8000";
                window.open(`${url}/dashboard`, "_blank");
              }}
            >
              <Hospital className="w-5 h-5" />
              <span>فتح لوحة تحكم العيادة</span>
            </Button>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">
              (For Clinic Staff Only / لموظفي العيادة فقط)
            </p>
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
