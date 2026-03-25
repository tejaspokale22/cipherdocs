import { CheckCircle, UserCheck, GraduationCap } from "lucide-react";

const roles = [
  {
    title: "Issuer",
    icon: UserCheck,
    description:
      "Issuer is an entity that issues the certificate in student's name, e.g., University.",
  },
  {
    title: "Student",
    icon: GraduationCap,
    description:
      "The person who is enrolled in a university and has a certificate issued by university.",
  },
  {
    title: "Verifier",
    icon: CheckCircle,
    description:
      "Verifier is an external authority e.g., an employer who is trying to verify the authenticity of a certificate.",
  },
];

export default function Roles() {
  return (
    <section className="bg-black py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-12 text-center tracking-tight">
          Type of users
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="group flex flex-col items-center justify-between bg-white/10 p-8 rounded-2xl hover:bg-white/15"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary-600/80 shadow-lg border-4 border-white/20">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-wide uppercase drop-shadow-lg">
                    {role.title}
                  </h3>
                </div>
                <p className="text-base text-white/80 leading-relaxed text-center px-2">
                  {role.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
