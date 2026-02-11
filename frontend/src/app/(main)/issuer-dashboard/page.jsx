import { Briefcase, FileText, Plus, Users } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function IssuerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="issuer">
      <main className="min-h-screen bg-white pt-24 pb-12 px-6 md:px-20 lg:px-36">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-black">
                Issuer Dashboard
              </h1>
              <p className="text-black/50 mt-1">
                Manage and issue certificates to users
              </p>
            </div>
            <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black/80 transition-colors cursor-pointer">
              <Plus className="h-5 w-5" />
              Issue Certificate
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-black/5 rounded-xl p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-black/50" />
                <span className="text-sm text-black/50">Total Issued</span>
              </div>
              <p className="text-3xl font-semibold">0</p>
            </div>
            <div className="bg-black/5 rounded-xl p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-black/50" />
                <span className="text-sm text-black/50">Recipients</span>
              </div>
              <p className="text-3xl font-semibold">0</p>
            </div>
            <div className="bg-black/5 rounded-xl p-6 border border-black/10">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="h-5 w-5 text-black/50" />
                <span className="text-sm text-black/50">Pending</span>
              </div>
              <p className="text-3xl font-semibold">0</p>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10">
              <h2 className="font-semibold">Issued Certificates</h2>
            </div>
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-black/20 mx-auto mb-4" />
              <p className="text-black/50">No certificates issued yet</p>
              <p className="text-sm text-black/30 mt-1">
                Issue your first certificate to get started
              </p>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
