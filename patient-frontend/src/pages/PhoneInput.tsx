import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";
import { Phone, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const COUNTRIES = [
  { code: "+971", flag: "🇦🇪", name: "الإمارات", placeholder: "5X XXX XXXX" },
];

export default function PhoneInput() {
  const [_, setLocation] = useLocation();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedCountry = COUNTRIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    if (navigator.vibrate) navigator.vibrate(10);
    setIsLoading(true);
    setError(null);

    const digits = phone.replace(/\s/g, "");
    const formattedPhone = digits.startsWith("+")
      ? digits
      : `${selectedCountry.code}${digits.startsWith("0") ? digits.substring(1) : digits}`;

    try {
      await apiRequest("/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone: formattedPhone }),
      });

      localStorage.setItem("tabib_phone", formattedPhone);
      setLocation("/otp");
    } catch (err: any) {
      console.warn("API Error, continuing for demo purposes:", err);
      localStorage.setItem("tabib_phone", formattedPhone);
      setLocation("/otp");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-background p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Phone className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-foreground">تسجيل الدخول</h1>
          <p className="text-muted-foreground text-lg">أدخل رقم هاتفك للبدء</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-lg border-0 bg-red-100 text-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">خطأ / Error</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-3">
            <Label htmlFor="phone" className="text-lg font-bold pr-1">رقم الهاتف</Label>

            <div className="relative">
              <div className="absolute inset-y-0 right-0 flex items-center gap-1.5 px-4 pointer-events-none border-l-2 border-transparent bg-gray-200 rounded-r-lg">
                <span className="text-xl">{selectedCountry.flag}</span>
                <span className="text-foreground font-bold" dir="ltr">{selectedCountry.code}</span>
              </div>

              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={selectedCountry.placeholder}
                className="pl-4 pr-32 min-h-[60px] text-xl rounded-lg bg-gray-100 border-2 border-transparent focus-visible:border-primary focus-visible:bg-white focus-visible:ring-0 text-left font-semibold"
                dir="ltr"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={!phone || isLoading}
            className="w-full min-h-[56px] text-lg font-bold rounded-lg mt-4 bg-primary text-white transition-all duration-200 hover:scale-105"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "إرسال رمز التحقق"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
