import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { HeartPulse, Send, Camera, X, UserCog, Stethoscope, AlertCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showHandoverDialog, setShowHandoverDialog] = useState(false);
  const [handoverComplete, setHandoverComplete] = useState(false);
  const [imageFile, setImageFile] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Check for "doctor" intent in messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === "user") {
      const text = lastMessage.text.toLowerCase();
      if (text.includes("doctor") || text.includes("طبيب") || text.includes("دكتور") || text.includes("مستشفى")) {
        // Show handover prompt after a slight delay
        setTimeout(() => setShowHandoverDialog(true), 1000);
      }
    }
  }, [messages]);

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

    const userText = input;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userText,
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
      
      const response = await apiRequest<{ response: string, structured?: any }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          patient_id: patientId,
          message: userText
        })
      });
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);

      // If urgency is high, show handover dialog
      if (response.structured?.urgency === "SEE_A_DOCTOR" || response.structured?.urgency === "EMERGENCY") {
        setTimeout(() => setShowHandoverDialog(true), 1500);
      }
    } catch (error) {
      console.error(error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "عذراً، الخادم الطبي غير متصل حالياً. يرجى التأكد من تشغيل Gemma 4.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const confirmHandover = async () => {
    setShowHandoverDialog(false);
    setIsTyping(true);
    
    try {
      const patientId = localStorage.getItem("tabib_patient_id");
      const patientName = localStorage.getItem("tabib_patient_name");
      const patientPhone = localStorage.getItem("tabib_patient_phone");

      await apiRequest("/api/notify-clinic", {
        method: "POST",
        body: JSON.stringify({
          patient_id: patientId,
          name: patientName,
          phone: patientPhone,
          summary: "الطلب: استشارة طبيب بخصوص " + messages[messages.length-1].text
        })
      });

      setHandoverComplete(true);
      const aiResponse: Message = {
        id: "handover_success",
        text: "تم إرسال بياناتك وصورك بنجاح إلى طاقم العيادة. سيقوم أحد الممرضين بمراجعة حالتك والتواصل معك قريباً.",
        sender: "ai",
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen-safe w-full flex-col bg-gray-50 pb-[env(safe-area-inset-bottom)]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-primary">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">طبيب</h1>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1">
          <span className="text-xs font-bold text-primary">متصل بالخادم المحلي</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex max-w-[85%] gap-2 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.sender === "ai" && (
                <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-auto">
                   <UserCog size={20} />
                </div>
              )}
              
              <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm font-medium shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-white text-foreground border border-gray-100 rounded-bl-none"
                  }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="User attached" className="max-w-[200px] rounded-lg mb-2 shadow-sm" />
                  )}
                  {msg.text && <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground mt-1 mx-1 uppercase">{msg.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-2">
              <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-auto">
                <UserCog size={20} />
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3 flex items-center gap-1 h-11">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <AnimatePresence>
        {showHandoverDialog && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="p-4 mx-4 mb-4 bg-white border-2 border-primary/20 rounded-2xl shadow-xl z-20"
          >
            <div className="flex gap-3 items-start mb-4">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Stethoscope size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground">هل ترغب باستشارة الطبيب؟</h3>
                <p className="text-sm text-muted-foreground font-medium">سيتم إرسال محادثتك وبياناتك إلى طاقم العيادة للمراجعة.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmHandover} className="flex-1 rounded-xl font-bold h-12">نعم، أرسل التقرير</Button>
              <Button variant="outline" onClick={() => setShowHandoverDialog(false)} className="flex-1 rounded-xl font-bold h-12">ليس الآن</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white p-3 border-t border-gray-100 pb-[calc(1rem+64px)] z-10">
        {imageFile && (
          <div className="mb-2 relative inline-block">
            <img src={imageFile} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-primary/10" />
            <button 
              onClick={() => setImageFile(null)}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md"
            >
              <X className="w-4 h-4" />
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
            className="shrink-0 h-12 w-12 rounded-xl text-muted-foreground hover:bg-gray-100 hover:text-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-6 w-6" />
          </Button>
          
          <div className="flex-1 bg-gray-100 rounded-xl flex items-center min-h-[48px] px-2 border-2 border-transparent focus-within:border-primary focus-within:bg-white transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="اكتب أعراضك هنا..."
              className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-base font-medium resize-none max-h-32"
              dir="rtl"
              rows={1}
            />
          </div>
          
          <Button 
            type="button" 
            onClick={handleSend}
            disabled={(!input.trim() && !imageFile) || isTyping}
            className="shrink-0 h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-95 disabled:scale-100"
          >
            <Send className="h-5 w-5" style={{ transform: "rotate(180deg) translateX(2px)" }} />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}