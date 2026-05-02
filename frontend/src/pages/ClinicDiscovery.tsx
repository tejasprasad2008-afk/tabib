import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Hospital, MapPin, Signal, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Clinic {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  public_url: string;
}

export default function ClinicDiscovery() {
  const [_, setLocation] = useLocation();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        // Simulate local network scan
        await new Promise(r => setTimeout(r, 2500));
        
        const response = await fetch("/clinics_registry.json");
        const data = await response.json();
        
        // Convert object to array
        const list = Object.values(data) as Clinic[];
        
        // Add a fallback demo clinic if empty
        if (list.length === 0) {
          list.push({
            id: "demo_clinic",
            name: "مركز طبيب النموذجي",
            city: "الرياض",
            lat: 24.7136,
            lng: 46.6753,
            phone: "+966 50 000 0000",
            public_url: "http://localhost:8000"
          });
        }
        
        setClinics(list);
      } catch (e) {
        console.error("Discovery error:", e);
      } finally {
        setIsLoading(false);
        setScanning(false);
      }
    };

    fetchClinics();
  }, []);

  const selectClinic = (clinic: Clinic) => {
    if (navigator.vibrate) navigator.vibrate(15);
    localStorage.setItem("tabib_clinic_id", clinic.id);
    localStorage.setItem("tabib_clinic_url", clinic.public_url);
    localStorage.setItem("tabib_clinic_name", clinic.name);
    setLocation("/app/profile-setup");
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-gray-50 pb-[env(safe-area-inset-bottom)]">
      <header className="px-6 pt-12 pb-6">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">البحث عن عيادة</h1>
        <p className="text-muted-foreground font-medium">نحن نبحث عن خوادم طبيب القريبة منك.</p>
      </header>

      <div className="flex-1 px-6">
        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full py-12"
            >
              <div className="relative mb-8">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary/20 rounded-full"
                />
                <div className="relative bg-primary p-6 rounded-full">
                  <Signal className="h-10 w-10 text-white" />
                </div>
              </div>
              <p className="text-lg font-bold text-primary animate-pulse">جاري مسح الشبكة المحلية...</p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">العيادات المتوفرة ({clinics.length})</span>
                <Button variant="ghost" size="sm" onClick={() => setScanning(true)} className="text-primary font-bold">
                  تحديث
                </Button>
              </div>

              {clinics.map((clinic) => (
                <motion.button
                  key={clinic.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectClinic(clinic)}
                  className="w-full bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 text-right hover:border-primary/30 transition-all shadow-sm"
                >
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Hospital className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-lg text-foreground">{clinic.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
                      <MapPin size={14} />
                      <span>{clinic.city}</span>
                      <span className="mx-1">•</span>
                      <span className="text-green-600">متصل الآن</span>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-300" />
                </motion.button>
              ))}
              
              <div className="pt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4 font-medium">
                  هل عيادتك غير موجودة؟ تأكد من تشغيل خادم طبيب على نفس الشبكة.
                </p>
                <Button variant="outline" className="rounded-full font-bold">
                  إدخال عنوان IP يدوياً
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
