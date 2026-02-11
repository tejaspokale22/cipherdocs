import { FileText, Download, CheckCircle, Clock } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function UserDashboardPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <main className="min-h-screen bg-white pt-24 pb-12 px-6 md:px-20 lg:px-36">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black">
              My Certificates
            </h1>
            <p className="text-black/50 mt-1">
              View and manage your received certificates
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/5 rounded-xl p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-black/50" />
                <span className="text-sm text-black/50">Total Received</span>
              </div>
              <p className="text-3xl font-semibold">0</p>
            </div>
            <div className="bg-black/5 rounded-xl p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-black/50" />
                <span className="text-sm text-black/50">Verified</span>
              </div>
              <p className="text-3xl font-semibold">0</p>
            </div>
            <div className="bg-black/5 rounded-xl p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-black/50" />
                <span className="text-sm text-black/50">Pending</span>
              </div>
              <p className="text-3xl font-semibold">0</p>
            </div>
          </div>

          {/* Certificates Grid */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10">
              <h2 className="font-semibold">My Certificates</h2>
            </div>
            <div className="p-12 text-center">
              <Download className="h-12 w-12 text-black/20 mx-auto mb-4" />
              <p className="text-black/50">No certificates received yet</p>
              <p className="text-sm text-black/30 mt-1">
                Certificates issued to you will appear here
              </p>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
