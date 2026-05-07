import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Hospital, MapPin, Search, Loader2, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Clinic {
  id: string;
  name: string;
  name_en: string;
  city: string;
  city_en: string;
  url: string;
  phone: string;
}

export default function ClinicRegistry() {
  const [_, setLocation] = useLocation();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // In a real scenario, this URL would be the GitHub Raw URL or a Registry API
    // For now, we fetch from our own public folder as a fallback
    fetch("/clinics.json")
      .then((res) => res.json())
      .then((data) => {
        setClinics(data.clinics);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch clinics:", err);
        setLoading(false);
      });
  }, []);

  const selectClinic = (clinic: Clinic) => {
    if (navigator.vibrate) navigator.vibrate(10);
    localStorage.setItem("selectedClinicUrl", clinic.url);
    localStorage.setItem("selectedClinicName", clinic.name);
    localStorage.setItem("selectedClinicId", clinic.id);
    setLocation("/phone");
  };

  const filteredClinics = clinics.filter(
    (c) =>
      c.name.includes(search) ||
      c.name_en.toLowerCase().includes(search.toLowerCase()) ||
      c.city.includes(search) ||
      c.city_en.toLowerCase().includes(search.toLowerCase())
  );

  const isUrl = search.startsWith("http");

  const selectCustomClinic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    localStorage.setItem("selectedClinicUrl", search);
    localStorage.setItem("selectedClinicName", "Custom Clinic");
    localStorage.setItem("selectedClinicId", "custom");
    setLocation("/phone");
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-background">
      <div className="p-6 pb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocation("/onboarding")}
          className="mb-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">اختر العيادة</h1>
        <p className="text-muted-foreground text-lg">Select your medical clinic</p>
      </div>

      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن عيادة... Search clinics"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 h-12 text-lg rounded-xl border-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredClinics.length > 0 ? (
          <div className="space-y-4">
            {filteredClinics.map((clinic) => (
              <motion.div
                key={clinic.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectClinic(clinic)}
                className="p-5 rounded-2xl border-2 border-muted hover:border-primary cursor-pointer transition-colors bg-card shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Hospital className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-1">{clinic.name}</h3>
                    <p className="text-muted-foreground font-medium mb-2">{clinic.name_en}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{clinic.city} / {clinic.city_en}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              لا توجد عيادات مطابقة
              <br />
              No clinics found
            </p>
            {isUrl && (
              <Button 
                onClick={selectCustomClinic}
                className="w-full h-12 rounded-xl bg-primary text-white font-bold"
              >
                Connect to Custom Clinic
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
