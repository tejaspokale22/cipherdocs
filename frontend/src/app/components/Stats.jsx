import { FileCheck, Users, Building2, Shield } from "lucide-react";

const stats = [
  {
    value: "50K+",
    label: "Documents Verified",
    icon: FileCheck,
    description: "Verified on-chain",
  },
  {
    value: "12K+",
    label: "Active Users",
    icon: Users,
    description: "Trust CipherDocs",
  },
  {
    value: "200+",
    label: "Institutions",
    icon: Building2,
    description: "Issuing documents",
  },
  {
    value: "99.9%",
    label: "Uptime",
    icon: Shield,
    description: "Reliable & secure",
  },
];

export default function Stats() {
  return (
    <section className="bg-black py-10 xs:py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 xs:gap-6 sm:gap-8 xs:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl bg-white/10 p-4 xs:p-6 text-center backdrop-blur-sm transition-all hover:bg-white/15"
              >
                <div className="mx-auto mb-3 xs:mb-4 flex h-10 w-10 xs:h-12 xs:w-12 items-center justify-center rounded-xl bg-white/20">
                  <Icon className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                </div>
                <p className="text-2xl xs:text-3xl font-bold text-white sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs xs:text-sm font-medium text-white/80">
                  {stat.label}
                </p>
                <p className="mt-1 text-[10px] xs:text-xs text-white/50">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
