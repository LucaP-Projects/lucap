"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Camera, 
  RefreshCw, 
  Check, 
  X, 
  FileText, 
  MessageSquare, 
  Plus, 
  Save, 
  Scan,
  Loader2,
  ChevronRight,
  Receipt,
  FileBarChart,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { uploadFileLocal } from "@/components/file-upload/action";
import { cn } from "@/lib/utils";

type Step = "scan" | "preview" | "workflow";

interface DocumentScannerProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId?: string;
  startWithGallery?: boolean;
}

export function DocumentScannerModal({ isOpen, onClose, tenantId, startWithGallery }: DocumentScannerProps) {
  const router = useRouter();
  const params = useParams();
  const companySlug = params["company-slug"] as string;

  const [step, setStep] = useState<Step>("scan");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && startWithGallery) {
      fileInputRef.current?.click();
    }
  }, [isOpen, startWithGallery]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });
      
      setStream(prev => {
        if (prev) {
          prev.getTracks().forEach(track => track.stop());
        }
        return mediaStream;
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please ensure permissions are granted.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    setStream(prev => {
      if (prev) {
        prev.getTracks().forEach(track => track.stop());
      }
      return null;
    });
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen && step === "scan") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, step, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);
            setCapturedBlob(blob);
            setStep("preview");
            stopCamera();
          }
        }, "image/jpeg", 0.85);
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setStep("scan");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      setCapturedBlob(file);
      setStep("preview");
      stopCamera();
    }
  };

  const handleNext = () => {
    setStep("workflow");
  };

  const executeWorkflow = async (type: "invoice" | "receipt" | "ticket" | "save") => {
    if (!capturedBlob) return;

    setIsUploading(true);
    try {
      const file = new File([capturedBlob], `scan_${Date.now()}.jpg`, { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      if (tenantId) formData.append("tenantId", tenantId);

      const result = await uploadFileLocal(formData);

      if (!result.success) throw new Error(result.error);

      toast.success("Document processed successfully");

      switch (type) {
        case "invoice":
          router.push(`/${companySlug}/invoices/new?attachment=${result.publicUrl}`);
          break;
        case "receipt":
          router.push(`/${companySlug}/sales-receipt/new?attachment=${result.publicUrl}`);
          break;
        case "ticket":
          router.push(`/${companySlug}/tickets?new=true&attachment=${result.publicUrl}`);
          break;
        case "save":
          // Stay on current page or redirect to a files view
          break;
      }
      
      onClose();
      resetState();
    } catch (err) {
      console.error("Workflow error:", err);
      toast.error("Failed to process document");
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setStep("scan");
    setCapturedImage(null);
    setCapturedBlob(null);
    setIsUploading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-150 h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            {step === "scan" ? "Scan Document" : step === "preview" ? "Preview Scan" : "Document Workflow"}
          </DialogTitle>
          <DialogDescription>
            {step === "scan" ? "Position the document in the frame and capture." : 
             step === "preview" ? "Confirm if the document is clear." : 
             "Choose what to do with this document."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {step === "scan" && (
            <div className="relative w-full h-full">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-40 border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-white/50 border-dashed rounded-lg" />
              </div>
              <div className="absolute bottom-8 left-0 right-0 flex justify-between items-center px-12 pb-4">
                <div className="w-16 flex justify-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full bg-black/20 text-white hover:bg-black/40"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-6 w-6" />
                  </Button>
                </div>

                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full h-16 w-16 border-4 border-white bg-white/20 hover:bg-white/40 group p-0"
                  onClick={capturePhoto}
                >
                  <div className="h-12 w-12 rounded-full bg-white group-active:scale-95 transition-transform" />
                </Button>

                <div className="w-16" />
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect}
              />
            </div>
          )}

          {step === "preview" && capturedImage && (
            <div className="relative w-full h-full flex flex-col">
              <div className="flex-1 relative">
                <Image 
                  src={capturedImage} 
                  alt="Captured document" 
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="bg-black/80 flex justify-center gap-4 p-6 shrink-0">
                <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={handleRetake}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button className="bg-primary hover:bg-primary/90" onClick={handleNext}>
                  <Check className="mr-2 h-4 w-4" />
                  Apply
                </Button>
              </div>
            </div>
          )}

          {step === "workflow" && (
            <div className="w-full h-full bg-slate-50 p-6 flex flex-col gap-4 overflow-y-auto">
              <h3 className="text-slate-900 font-semibold mb-2">Select Action</h3>
              
              <WorkflowCard 
                title="Create Invoice" 
                description="Draft a new invoice using this scan as billable proof."
                icon={FileText}
                onClick={() => executeWorkflow("invoice")}
                disabled={isUploading}
              />
              
              <WorkflowCard 
                title="Sales Receipt" 
                description="Log a completed sale with this receipt image."
                icon={Receipt}
                onClick={() => executeWorkflow("receipt")}
                disabled={isUploading}
              />

              <WorkflowCard 
                title="Support Ticket" 
                description="Start a conversation with an accountant about this document."
                icon={MessageSquare}
                onClick={() => executeWorkflow("ticket")}
                disabled={isUploading}
              />

              <WorkflowCard 
                title="Save into Company Files" 
                description="Upload and store for later reference."
                icon={Save}
                onClick={() => executeWorkflow("save")}
                disabled={isUploading}
              />

              {isUploading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-slate-600">Processing Document...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}

function WorkflowCard({ title, description, icon: Icon, onClick, disabled }: any) {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:border-primary/50 transition-colors bg-white",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={!disabled ? onClick : undefined}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-slate-900">{title}</h4>
          <p className="text-sm text-slate-500 line-clamp-1">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400" />
      </CardContent>
    </Card>
  );
}
