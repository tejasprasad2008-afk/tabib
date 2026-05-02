import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { HeartPulse, Send, Camera, Image as ImageIcon, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  image?: string;
}

export default function ChatScreen() {
  const [_, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "مرحباً بك في طبيب! أنا مساعدك الطبي. كيف يمكنني مساعدتك اليوم؟",
      sender: "ai",
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNotifyBanner, setShowNotifyBanner] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aiMessageCount = messages.filter(m => m.sender === "ai").length;

  useEffect(() => {
    if (aiMessageCount >= 3) {
      setShowNotifyBanner(true);
    }
  }, [aiMessageCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !imageFile) return;
    if (navigator.vibrate) navigator.vibrate(10);

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      image: imageFile || undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setImageFile(null);
    setIsTyping(true);

    try {
      const patientId = localStorage.getItem("tabib_patient_id") || "demo_patient";
      
      // Mocking API call
      // await apiRequest("/api/chat", {
      //   method: "POST",
      //   body: JSON.stringify({ patient_id: patientId, message: newMessage.text, image_base64: newMessage.image })
      // });
      
      await new Promise(r => setTimeout(r, 1500));
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "شكراً لمشاركتك هذه المعلومات. هل تعاني من أي أعراض أخرى مثل ارتفاع درجة الحرارة أو الصداع؟",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error(error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNotifyClinic = async () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setIsNotifying(true);
    
    try {
      const patientId = localStorage.getItem("tabib_patient_id") || "demo_patient";
      // await apiRequest("/api/notify-clinic", {
      //   method: "POST",
      //   body: JSON.stringify({ patient_id: patientId, consent: true })
      // });
      
      await new Promise(r => setTimeout(r, 1000));
      setLocation("/success");
    } catch (error) {
      console.error(error);
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-gray-50 pb-[env(safe-area-inset-bottom)]">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-primary">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">طبيب</h1>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1">
          <span className="text-xs font-bold text-primary">رقم في الطابور: #3</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-[85%] gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.sender === "ai" && (
                <img
                  src="/nurse-avatar.png"
                  alt="ممرضة"
                  className="h-9 w-9 shrink-0 rounded-full object-cover mt-auto bg-gray-200"
                />
              )}
              
              <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-lg px-4 py-3 text-sm font-medium ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-foreground"
                  }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="User attached" className="max-w-[200px] rounded-md mb-2" />
                  )}
                  {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground mt-1 mx-1">{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-2">
              <img
                src="/nurse-avatar.png"
                alt="ممرضة"
                className="h-9 w-9 shrink-0 rounded-full object-cover mt-auto bg-gray-200"
              />
              <div className="rounded-lg bg-gray-100 px-4 py-3 flex items-center gap-1 h-11">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Notify Banner */}
      {showNotifyBanner && (
        <div className="bg-primary p-3 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 z-10">
          <span className="text-sm font-bold text-white">هل تريد إعلام العيادة بحالتك؟</span>
          <Button 
            size="sm" 
            onClick={handleNotifyClinic} 
            disabled={isNotifying}
            className="rounded-lg font-bold bg-white text-primary hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          >
            {isNotifying ? "جاري الإعلام..." : "إعلام العيادة"}
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="bg-white p-3 border-t border-gray-200 pb-[calc(1rem+64px)] z-10">
        {imageFile && (
          <div className="mb-2 relative inline-block">
            <img src={imageFile} alt="Preview" className="h-16 rounded-md border-0 bg-gray-100" />
            <button 
              onClick={() => setImageFile(null)}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="shrink-0 h-12 w-12 rounded-lg text-muted-foreground hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 bg-gray-100 rounded-lg flex items-center min-h-[48px] px-2 border-2 border-transparent focus-within:border-primary focus-within:bg-white transition-colors">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="اكتب أعراضك هنا..."
              className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-base font-medium"
              dir="rtl"
            />
          </div>
          
          <Button 
            type="button" 
            onClick={handleSend}
            disabled={(!input.trim() && !imageFile) || isTyping}
            className="shrink-0 h-12 w-12 rounded-lg bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
          >
            <Send className="h-5 w-5" style={{ transform: "rotate(180deg) translateX(2px)" }} />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
