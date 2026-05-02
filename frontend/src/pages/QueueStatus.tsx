import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import BottomNav from "@/components/BottomNav";

interface QueueData {
  position: number;
  estimatedWaitMinutes: number;
  emergencyLevel: "emergency" | "see_doctor" | "home_care";
  lastUpdated: string;
}

export default function QueueStatus() {
  const [data, setData] = useState<QueueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    setError(null);
    try {
      const patientId = localStorage.getItem("tabib_patient_id") || "demo_patient";
      
      await new Promise(r => setTimeout(r, 800));
      setData({
        position: 3,
        estimatedWaitMinutes: 15,
        emergencyLevel: "see_doctor",
        lastUpdated: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      setError("حدث خطأ أثناء تحديث حالة الطابور.\nError fetching queue status.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchQueue().finally(() => setIsLoading(false));
    
    const interval = setInterval(() => {
      setIsRefreshing(true);
      fetchQueue().finally(() => setIsRefreshing(false));
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setIsRefreshing(true);
    fetchQueue().finally(() => setIsRefreshing(false));
  };

  const getEmergencyBadge = (level: string) => {
    switch(level) {
      case "emergency":
        return { text: "طارئ", bg: "bg-destructive", icon: "🔴" };
      case "see_doctor":
        return { text: "مراجعة الطبيب", bg: "bg-[#F59E0B]", icon: "🟡" };
      case "home_care":
        return { text: "رعاية منزلية", bg: "bg-[#10B981]", icon: "🟢" };
      default:
        return { text: "قيد المراجعة", bg: "bg-gray-400", icon: "⚪" };
    }
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-gray-50 pb-[env(safe-area-inset-bottom)] relative">
      <header className="flex h-16 shrink-0 items-center justify-center border-b border-gray-200 bg-white px-4 z-10 relative">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">حالة الطابور</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleManualRefresh}
          disabled={isRefreshing || isLoading}
          className="absolute left-4 min-h-[44px] min-w-[44px] text-primary hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-bold">جاري التحميل...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="w-full max-w-sm mb-6 border-0 bg-red-100 text-red-900 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">خطأ / Error</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
            <Button onClick={handleManualRefresh} variant="outline" className="mt-4 w-full bg-white text-destructive border-0 transition-all duration-200 hover:scale-105">
              إعادة المحاولة
            </Button>
          </Alert>
        ) : data ? (
          <div className="w-full max-w-sm flex flex-col items-center gap-8">
            <div className="bg-white rounded-lg p-8 w-full flex flex-col items-center text-center">
              <span className="text-gray-500 font-bold mb-2 text-lg">رقمك في الطابور</span>
              <div className="text-7xl font-extrabold text-primary mb-6">
                #{data.position}
              </div>
              
              <div className="w-full h-1 bg-gray-100 mb-6"></div>
              
              <span className="text-gray-500 font-bold mb-1">وقت الانتظار المتوقع</span>
              <div className="text-3xl font-extrabold text-foreground mb-2">
                {data.estimatedWaitMinutes} دقيقة
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 w-full flex flex-col items-center text-center">
              <span className="text-gray-500 font-bold mb-3">مستوى الحالة</span>
              
              <div className={`px-6 py-4 rounded-lg text-white font-extrabold text-lg flex items-center gap-3 w-full justify-center ${getEmergencyBadge(data.emergencyLevel).bg}`}>
                <span className="text-2xl leading-none">{getEmergencyBadge(data.emergencyLevel).icon}</span>
                {getEmergencyBadge(data.emergencyLevel).text}
              </div>
            </div>
            
            <p className="text-sm font-bold text-gray-400 mt-4">
              آخر تحديث: {data.lastUpdated}
            </p>
          </div>
        ) : null}
      </div>

      <BottomNav />
    </div>
  );
}