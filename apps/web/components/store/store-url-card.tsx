"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoreUrlCardProps {
  companySlug: string;
  storeSlug: string;
}

export function StoreUrlCard({ companySlug, storeSlug }: StoreUrlCardProps) {
  const [copied, setCopied] = useState(false);
  const path = `/${companySlug}/marketplace/${storeSlug}`;

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Store URL copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg">
      <div className="border-b border-gray-100 bg-purple-50 px-4 py-2">
        <h3 className="text-sm font-medium text-purple-700">Store URL</h3>
      </div>
      <div className="p-4 lg:p-5">
        <div className="flex items-center">
          <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
              <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.5-1.5" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-medium text-gray-900 hover:text-purple-700 hover:underline"
              title={path}
            >
              {path}
            </Link>
            <p className="mt-1 text-sm text-gray-600">Public storefront path</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-2 shrink-0"
            onClick={handleCopy}
            title="Copy store URL"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
