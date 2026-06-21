'use client';
import React from 'react';
import { FileX, HomeIcon, ArrowLeft, HelpCircle } from 'lucide-react';

const NotFound = () => (
  <div className="flex h-auto items-center justify-center bg-gray-50/50 p-4">
    <div className="w-full max-w-lg transform rounded-xl bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl md:p-8">
      {/* Error Icon with Pulse Effect */}
      <div className="mb-8 flex flex-col items-center">
        <div className="relative">
          <div className="animate-pulse rounded-full bg-red-100 p-4">
            <FileX className="h-16 w-16 text-red-500 transition-transform duration-300 ease-in-out hover:scale-110" />
          </div>
          <div className="absolute -inset-1 animate-ping rounded-full bg-red-50 opacity-75" />
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Journal Entry Not Found
        </h1>
        <p className="text-gray-600">
          We couldn&apos;t locate the journal entry you&apos;re looking for. It
          may have been deleted or moved to a different location.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 space-y-4">
        <button
          onClick={() => window.history.back()}
          className="group flex w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-6 py-3 text-white transition-all duration-300 hover:bg-blue-700"
        >
          <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
          <span>Go Back</span>
        </button>

        <button
          onClick={() => (window.location.href = '/')}
          className="group flex w-full items-center justify-center gap-3 rounded-lg bg-gray-100 px-6 py-3 text-gray-700 transition-all duration-300 hover:bg-gray-200"
        >
          <HomeIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Help Section */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <HelpCircle className="h-4 w-4" />
          <p>
            Need assistance? Contact your system administrator or check the
            accounting logs
          </p>
        </div>
      </div>

      {/* Visual Decorations */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-blue-100 to-blue-50 opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75" />
      </div>
    </div>
  </div>
);

export default NotFound;
