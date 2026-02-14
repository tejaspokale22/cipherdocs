import { X } from "lucide-react";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-sm mx-auto animate-fade-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/10 focus:outline-none cursor-pointer"
          onClick={onClose}
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
              className="px-4 py-1 rounded-lg bg-black/10 text-black font-medium hover:bg-black/20 transition-colors focus:outline-none cursor-pointer"
              onClick={onClose}
              type="button"
            >
              {cancelText}
            </button>
            <button
              className="px-4 py-1 rounded-lg bg-red-500 text-white font-medium hover:bg-red-00 transition-colors focus:outline-none cursor-pointer"
              onClick={onConfirm}
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
