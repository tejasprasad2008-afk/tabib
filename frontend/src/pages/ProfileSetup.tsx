import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { User, ArrowRight, Loader2 } from "lucide-react";

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: ""
  });

  const handleSubmit = async () => {
    if (!formData.age || !formData.gender || !formData.height_cm || !formData.weight_kg) {
      setError("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }

    const age = parseInt(formData.age);
    const height = parseInt(formData.height_cm);
    const weight = parseInt(formData.weight_kg);

    if (age < 1 || age > 120) {
      setError("العمر يجب أن يكون بين 1 و 120");
      return;
    }
    if (height < 50 || height > 300) {
      setError("الطول يجب أن يكون بين 50 و 300 سم");
      return;
    }
    if (weight < 10 || weight > 500) {
      setError("الوزن يجب أن يكون بين 10 و 500 كجم");
      return;
    }

    if (navigator.vibrate) navigator.vibrate(10);
    setIsLoading(true);
    setError(null);

    try {
      await apiRequest("/api/patient/profile", {
        method: "POST",
        body: JSON.stringify({
          age: age,
          gender: formData.gender,
          height_cm: height,
          weight_kg: weight
        })
      });
      
      localStorage.setItem("tabib_profile_completed", "true");
      setLocation("/chat");
    } catch (err: any) {
      setError("حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-background p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">معلوماتك الصحية</h1>
          <p className="text-muted-foreground text-lg">
            نحتاج بعض المعلومات لتقديم أفضل رعاية لك
          </p>
        </div>

        <div className="space-y-5">
          {/* Age */}
          <div>
            <label className="text-lg font-bold pr-1 block mb-2">العمر *</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="عمرك بالسنوات"
              className="w-full h-14 px-4 text-lg border-2 border-input rounded-xl bg-background focus:border-primary focus:outline-none"
              min="1"
              max="120"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-lg font-bold pr-1 block mb-2">الجنس *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: "male" })}
                className={`flex-1 h-14 rounded-xl border-2 text-lg font-bold transition-all ${
                  formData.gender === "male" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-input bg-background text-muted-foreground"
                }`}
              >
                ذكر
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: "female" })}
                className={`flex-1 h-14 rounded-xl border-2 text-lg font-bold transition-all ${
                  formData.gender === "female" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-input bg-background text-muted-foreground"
                }`}
              >
                أنثى
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, gender: "other" })}
                className={`flex-1 h-14 rounded-xl border-2 text-lg font-bold transition-all ${
                  formData.gender === "other" 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-input bg-background text-muted-foreground"
                }`}
              >
                آخر
              </button>
            </div>
          </div>

          {/* Height */}
          <div>
            <label className="text-lg font-bold pr-1 block mb-2">الطول (سم) *</label>
            <input
              type="number"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              placeholder="طولك بالسنتمتر"
              className="w-full h-14 px-4 text-lg border-2 border-input rounded-xl bg-background focus:border-primary focus:outline-none"
              min="50"
              max="300"
            />
          </div>

          {/* Weight */}
          <div>
            <label className="text-lg font-bold pr-1 block mb-2">الوزن (كجم) *</label>
            <input
              type="number"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              placeholder="وزنك بالكيلوغرام"
              className="w-full h-14 px-4 text-lg border-2 border-input rounded-xl bg-background focus:border-primary focus:outline-none"
              min="10"
              max="500"
            />
          </div>

          {error && (
            <p className="text-destructive text-center font-bold">{error}</p>
          )}

          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full h-14 text-xl font-bold rounded-xl mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-margin-left mr-2" />
                جاري الحفظ...
              </>
            ) : (
              <>
                بدء المحادثة
                <ArrowRight className="w-5 h-5 mr-2" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            هذه المعلومات مهمة لتقديم رعاية طبية دقيقة
          </p>
        </div>
      </div>
    </div>
  );
}