import { X } from "lucide-react";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}) {
  if (!open) return null;
  const handleOverlayClick = () => {
    if (!loading) onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 cursor-pointer"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-sm mx-auto animate-fade-in relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          type="button"
        >
          <X className="h-5 w-5 text-black/50" />
        </button>
        <div className="flex flex-col items-center p-6">
          <h3 className="text-lg font-semibold text-black mb-2 text-left w-full">
            {title}
          </h3>
          <p className="text-black/60 mb-8 text-xs text-left w-full">
            {description}
          </p>
          <div className="flex gap-2 w-full justify-end text-sm">
            <button
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-black/30 text-black hover:bg-black/5 transition disabled:opacity-60 w-full sm:w-auto cursor-pointer"
              onClick={onClose}
              disabled={loading}
              type="button"
            >
              {cancelText}
            </button>
            <button
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-red-500 bg-white text-red-600 text-xs hover:bg-red-50 transition disabled:opacity-60 w-full sm:w-auto cursor-pointer disabled:cursor-not-allowed"
              onClick={onConfirm}
              disabled={loading}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
