"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import { useParams } from "next/navigation";
import { 
  SendIcon, 
  AtSignIcon, 
  X, 
  User, 
  FileText, 
  Plus, 
  Mic, 
  Maximize2, 
  Minimize2,
  MoreVertical} from "lucide-react";
import { referenceSearch } from "@/app/(app)/[company-slug]/assistant/actions";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { 
  Message, 
  MessageContent,
} from "@/components/ui/message";
import { 
  MessageScroller, 
  MessageScrollerContent, 
  MessageScrollerViewport,
  MessageScrollerItem} from "@/components/ui/message-scroller";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAssistantStore } from "@/stores/useAssistantStore";
import { useChat, getMessageText } from "@/lib/ai";

interface AssistantPanelProps {
  fullScreen?: boolean;
  onClose?: () => void;
  onToggleFullScreen?: () => void;
}

export function AssistantPanel({ fullScreen, onClose, onToggleFullScreen }: AssistantPanelProps) {
  const params = useParams();
  const companySlug = params["company-slug"] as string;
  const { data: session } = authClient.useSession();
  const uiContext = useAssistantStore((state) => state.currentUIContext);
  
  const [selectedReferences, setSelectedReferences] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const companyId = companySlug; 

  const { 
    messages, 
    sendMessage,
    status,
    setMessages,
    input,
    handleInputChange,
    setInput
  } = useChat({
    body: {
      companyId,
      uiContext,
      references: selectedReferences
    },
    onFinish: () => {
        setSelectedReferences([]);
    }
  });

  const isBusy = status === "streaming" || status === "submitted";

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!companyId) return;
      const results = await referenceSearch(query, companyId);
      setMentionResults(results);
    }, 300),
    [companyId]
  );

  useEffect(() => {
    if (mentionQuery) {
      debouncedSearch(mentionQuery);
    } else {
      setMentionResults([]);
    }
  }, [mentionQuery, debouncedSearch]);

  const onInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);

    const lastAtPos = val.lastIndexOf("@");
    if (lastAtPos !== -1 && lastAtPos >= val.length - 20) {
      const query = val.slice(lastAtPos + 1);
      if (!query.includes(" ")) {
        setMentionQuery(query);
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);

    // Auto-resize textarea
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input?.trim() && selectedReferences.length === 0) return;
    
    sendMessage({ text: input });
    setInput("");
    
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const addReference = (ref: any) => {
    if (!selectedReferences.find(r => r.id === ref.id)) {
        setSelectedReferences([...selectedReferences, ref]);
    }
    setShowMentions(false);
  };

  const PROMPTS = [
    { title: "Manage customer base", label: "Ways to use Intelligence for customers" },
    { title: "Connect bank account", label: "Connect my bank account" },
    { title: "Top customers", label: "Which customers bring me the most business?" },
  ];

  return (
    <div className={cn(
        "flex flex-col bg-white h-full relative overflow-hidden transition-all duration-300",
        fullScreen ? "w-full" : "w-full md:w-[450px]"
    )}>
      {/* Intuit-style Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 bg-white z-10">
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-2">
            {/* Minimalist Logo/Icon */}
            <div className="relative">
                <div className="h-6 w-6 rounded-full bg-linear-to-tr from-blue-600 to-emerald-500" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">L</div>
            </div>
            <h1 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                Intelligence
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">Beta</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
            <MoreVertical className="h-4 w-4" />
          </Button>
          {onToggleFullScreen && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={onToggleFullScreen}>
              {fullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-white">
        <MessageScroller className="h-full">
          <MessageScrollerViewport className="p-4 md:p-6">
            <MessageScrollerContent className="max-w-2xl mx-auto pb-12">
              
              {messages.length === 0 && (
                <div className="flex flex-col py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold text-slate-900 leading-tight">
                            The power of AI and trusted experts, working for you
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {PROMPTS.map((p, i) => (
                            <div key={i} className="space-y-2 group">
                                <p className="text-sm text-slate-600">{p.title}</p>
                                <button 
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                                    onClick={() => sendMessage({ text: p.label })}
                                >
                                    {p.label}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              <div className="space-y-6">
                  {messages.map((m, index) => (
                    <MessageScrollerItem key={m.id} scrollAnchor={m.role === "user"}>
                        <Message align={m.role === "user" ? "end" : "start"} className="gap-3">
                            {/* User Avatar only shown for user messages if desired, but Intuit style often hides them or uses plain text */}
                            <MessageContent className="max-w-[85%]">
                                <Bubble 
                                    variant={m.role === "user" ? "default" : "secondary"}
                                    className={cn(
                                        "rounded-2xl px-4 py-3 shadow-none border",
                                        m.role === "user" 
                                            ? "bg-slate-900 text-white border-slate-900" 
                                            : "bg-slate-50 text-slate-800 border-slate-100"
                                    )}
                                >
                                    <BubbleContent>
                                        {m.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{getMessageText(m)}</p>}
                                        
                                        {m.toolInvocations && m.toolInvocations.map((toolInvocation: any) => {
                                          const toolCallId = toolInvocation.toolCallId;

                                          if (toolInvocation.state === 'result') {
                                            return (
                                              <div key={toolCallId} className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-[11px] font-mono overflow-auto max-h-40">
                                                <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                                                  {toolInvocation.toolName} Result
                                                </div>
                                                <pre className="text-slate-700">{JSON.stringify(toolInvocation.result, null, 2)}</pre>
                                              </div>
                                            );
                                          }

                                          return (
                                            <div key={toolCallId} className="mt-3 p-2 bg-white/50 rounded-lg border border-dashed border-slate-200 text-[10px] text-slate-400 flex items-center gap-2">
                                              <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse" />
                                              Analyzing...
                                            </div>
                                          );
                                        })}
                                    </BubbleContent>
                                </Bubble>
                            </MessageContent>
                        </Message>
                    </MessageScrollerItem>
                  ))}
              </div>

              {isBusy && (
                <div className="mt-4 flex gap-1.5 px-4">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
                </div>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
        </MessageScroller>
      </div>

      {/* Intuit-style Input Area */}
      <footer className="p-4 md:p-6 bg-white relative">
        {showMentions && mentionResults.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 p-4 bg-white border-t shadow-2xl z-50 animate-in slide-in-from-bottom-2">
                <div className="max-w-2xl mx-auto flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-slate-400 mb-2 px-2 flex items-center gap-1.5">
                        <AtSignIcon className="h-3 w-3" />
                        MENTION REFERENCE
                    </p>
                    {mentionResults.map((res) => (
                        <button
                            key={res.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left transition-colors"
                            onClick={() => addReference(res)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-7 w-7 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                                    {res.type === 'customer' ? <User className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-800">{res.label}</p>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-tighter">{res.type}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        <div className="max-w-2xl mx-auto mb-2 flex flex-wrap gap-1.5">
            {selectedReferences.map((ref) => (
                <div key={ref.id} className="flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-medium shadow-sm">
                    {ref.label}
                    <button 
                        onClick={() => setSelectedReferences(selectedReferences.filter(r => r.id !== ref.id))}
                        className="hover:text-red-500 transition-colors ml-0.5"
                    >
                        <X className="h-2.5 w-2.5" />
                    </button>
                </div>
            ))}
        </div>

        <form 
          onSubmit={handleFormSubmit}
          className="max-w-2xl mx-auto"
        >
          <div className="relative group p-[1px] rounded-[20px] bg-slate-200 focus-within:bg-blue-600 transition-all duration-300">
            <div className="bg-white rounded-[19px] p-2 flex flex-col">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={onInputChange}
                    placeholder="Ask anything"
                    className="w-full min-h-[44px] max-h-40 p-3 pr-10 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none scrollbar-none"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !showMentions) {
                            e.preventDefault();
                            handleFormSubmit(e as any);
                        }
                    }}
                    rows={1}
                />
                <div className="flex items-center justify-between px-2 pb-1">
                    <div className="flex items-center gap-1">
                        <Button 
                            type="button" 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                         <Button 
                            type="button" 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        >
                            <Mic className="h-4 w-4" />
                        </Button>
                        <Button 
                            type="submit" 
                            size="icon" 
                            className={cn(
                                "h-8 w-8 rounded-full transition-all duration-200",
                                (input || "").trim() 
                                    ? "bg-blue-600 text-white shadow-sm scale-100" 
                                    : "bg-slate-50 text-slate-300 scale-90 opacity-0 pointer-events-none"
                            )}
                            disabled={isBusy}
                        >
                            <SendIcon className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 px-4 leading-relaxed">
            Intelligence can make mistakes. Intuit protects privacy and adheres to responsible AI principles. <span className="text-blue-500 hover:underline cursor-pointer">How we use AI.</span>
          </p>
        </form>
      </footer>
    </div>
  );
}
