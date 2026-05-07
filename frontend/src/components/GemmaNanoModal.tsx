import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Download, X, Loader2 } from "lucide-react";

interface GemmaNanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  isInstalling?: boolean;
  installProgress?: number;
}

export default function GemmaNanoModal({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  isInstalling = false,
  installProgress = 0
}: GemmaNanoModalProps) {
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
        
        {!isInstalling ? (
          <>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h2 className="text-xl font-extrabold text-center mb-2">
              هل تريد تشغيل الذكاء الاصطناعي على جهازك؟
            </h2>
            
            <p className="text-gray-600 text-center text-sm mb-4">
              Gemini Nano سيعمل على هاتفك بدون الإنترنت ليقدم لك better استجابة faster
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>عمل بدون إنترنت</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>استجابات أسرع</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>خصوصية أفضل</span>
              </div>
            </div>

            {!showDeclineConfirm ? (
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowDeclineConfirm(true)}
                  className="flex-1 font-bold"
                >
                  لاحقاً
                </Button>
                <Button 
                  onClick={onAccept}
                  className="flex-1 font-bold bg-primary"
                >
                  موافق
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-center text-gray-600">
                  بالتأكيد تريد تخطي هذه الميزة؟
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowDeclineConfirm(false)}
                    className="flex-1 font-bold"
                  >
                   رجوع
                  </Button>
                  <Button 
                    onClick={onDecline}
                    className="flex-1 font-bold bg-gray-500"
                  >
                    نعم، تخطي
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Download className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-xl font-extrabold text-center mb-2">
              جاري تنزيل Gemini Nano
            </h2>
            
            <p className="text-gray-600 text-center text-sm mb-4">
              يمكنك الاستمرار في استخدام التطبيق أثناء التنزيل
            </p>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${installProgress || 30}%` }}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري الإعداد...</span>
            </div>

            <Button 
              variant="outline"
              onClick={onClose}
              className="w-full mt-4 font-bold"
            >
              متابعة بدون انتظار
            </Button>
          </>
        )}

      </div>
    </div>
  );
}