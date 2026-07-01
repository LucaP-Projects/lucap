"use client";

import { useState } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  File, 
  MoreVertical, 
  Download, 
  Trash2, 
  Eye,
  Search,
  Grid,
  List,
  Filter,
  FileIcon,
  Receipt,
  Loader2,
  Plus,
  Upload
} from "lucide-react";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { deleteFile, uploadToDrive } from "./actions";
import { toast } from "sonner";
import { useRef } from "react";
import { DocumentScannerModal } from "../document-scanner";

interface DriveViewProps {
  files: any[];
  companySlug: string;
}

export function DriveView({ files, companySlug }: DriveViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId, companySlug);
      toast.success("File deleted successfully");
    } catch (err) {
      toast.error("Failed to delete file");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", "drive_upload");
      
      await uploadToDrive(formData, companySlug);
      toast.success("File uploaded to drive");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.includes("image")) return ImageIcon;
    if (mimetype.includes("pdf")) return FileText;
    return File;
  };

  const handleOpenScanner = () => {
    // We can't access ActionButton's state directly, 
    // but we can trigger the DocumentScannerModal here too if we want.
    // For now, let's keep it simple.
    toast.info("Opening scanner...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center border rounded-md p-1 bg-muted/50">
            <Button 
                variant={viewMode === "grid" ? "white" : "ghost"} 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
                variant={viewMode === "list" ? "white" : "ghost"} 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            className="sm:hidden w-8 h-8 p-0" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
            <Button 
                variant="outline" 
                className="font-bold h-9"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
            >
                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload File
            </Button>
            <Button 
                className="bg-navy hover:bg-navy-light text-white font-bold shadow-md h-9 px-4"
                onClick={() => setIsScannerOpen(true)}
            >
                <Plus className="h-5 w-5 mr-1" />
                New Document
            </Button>
        </div>
      </div>

      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
      />

      <DocumentScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
      />

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-xl bg-muted/30">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <File className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No documents found</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            You haven't uploaded any documents yet or your search returned no results.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const Icon = getFileIcon(file.mimetype);
            return (
              <Card key={file.id} className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-muted/50 flex items-center justify-center relative group-hover:bg-muted/30 transition-colors">
                    {file.mimetype.includes("image") ? (
                        <div className="w-full h-full relative">
                            {/* In a real app we'd use Next Image here */}
                            <img src={file.path} alt={file.filename} className="object-cover w-full h-full" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                    ) : (
                        <Icon className="h-12 w-12 text-muted-foreground/50" />
                    )}
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="white" size="icon" className="h-8 w-8 shadow-sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href={file.path} download={file.filename}>
                                        <Download className="h-4 w-4 mr-2" /> Download
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(file.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate" title={file.filename}>
                      {file.filename}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(file.createdAt), "MMM d, yyyy")}
                      </p>
                      <Badge variant="outline" className="text-[10px] px-1.5 h-4 bg-muted/30 capitalize">
                        {file.purpose.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Purpose</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Size</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file.mimetype);
                return (
                  <tr key={file.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-4 py-3 font-medium flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="truncate max-w-[200px]">{file.filename}</span>
                    </td>
                    <td className="px-4 py-3 italic text-muted-foreground capitalize">
                      {file.purpose.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(file.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a href={file.path} download={file.filename}>
                                        <Download className="h-4 w-4 mr-2" /> Download
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(file.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
