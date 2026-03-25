"use client";

import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

/**
 * Error/Success Display Component
 * Reusable component for showing messages in the UI
 */
export function ErrorDisplay({ message, type = "error" }) {
  if (!message) return null;

  const config = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: XCircle,
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: CheckCircle,
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: AlertCircle,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: Info,
    },
  };

  const { bg, border, text, icon: Icon } = config[type];

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border ${border} ${bg} p-4 ${text}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

/**
 * Loading Display Component
 */
export function LoadingDisplay({ message = "Processing..." }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg bg-gray-50 p-8">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

/**
 * Result Display Component
 */
export function ResultDisplay({ title, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {title && <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>}
      {children}
    </div>
  );
}
