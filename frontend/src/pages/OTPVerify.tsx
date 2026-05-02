import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { KeyRound, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function OTPVerify() {
  const [_, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  
  const phone = localStorage.getItem("tabib_phone") || "";

  useEffect(() => {
    if (!phone) {
      setLocation("/app/phone");
    }
  }, [phone, setLocation]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (otpValue: string) => {
    if (otpValue.length !== 6) return;
    
    if (navigator.vibrate) navigator.vibrate(10);
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 1000));
      
      if (otpValue === "123456") {
        localStorage.setItem("tabib_token", "mock_jwt_token_123");
        localStorage.setItem("tabib_patient_id", "patient_abc123");
        setLocation("/app/chat");
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (err: any) {
      setError("الرمز غير صحيح. يرجى المحاولة مرة أخرى.\nInvalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-background p-6">
      <div className="absolute top-0 right-0 p-4 z-10 w-full flex justify-start">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/app/phone")} className="min-h-[44px] min-w-[44px] rounded-lg">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pt-10">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <KeyRound className="h-10 w-10 text-primary" />
          </div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-foreground">رمز التحقق</h1>
          <p className="text-muted-foreground text-lg mb-2">
            أدخل رمز التحقق المرسل إلى هاتفك
          </p>
          <p className="text-foreground font-bold" dir="ltr">{phone}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 rounded-lg border-0 bg-red-100 text-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">خطأ / Error</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
          </Alert>
        )}

        <Alert className="mb-8 bg-gray-100 border-0 rounded-lg">
          <AlertDescription className="text-primary text-center font-bold">
            في وضع التجربة، الرمز هو: 123456
          </AlertDescription>
        </Alert>

        <div className="flex flex-col items-center gap-8">
          <div dir="ltr">
            <InputOTP 
              maxLength={6} 
              value={code} 
              onChange={(val) => {
                setCode(val);
                if (val.length === 6) handleVerify(val);
              }}
              disabled={isLoading}
            >
              <InputOTPGroup className="gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <InputOTPSlot 
                    key={index}
                    index={index} 
                    className="w-12 h-14 text-2xl font-bold rounded-lg bg-gray-100 border-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-white data-[state=active]:ring-0 transition-colors" 
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <Button 
              onClick={() => handleVerify(code)} 
              size="lg" 
              disabled={code.length !== 6 || isLoading}
              className="w-full min-h-[56px] text-lg font-bold rounded-lg bg-primary text-white transition-all duration-200 hover:scale-105"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "تأكيد الرمز"
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleResend} 
              disabled={countdown > 0 || isLoading}
              className="w-full min-h-[44px] text-muted-foreground font-bold rounded-lg"
            >
              {countdown > 0 ? `إعادة إرسال الرمز بعد ${countdown}ث` : "إعادة إرسال الرمز"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}