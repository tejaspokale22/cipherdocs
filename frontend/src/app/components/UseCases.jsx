import {
  GraduationCap,
  Briefcase,
  Heart,
  Building,
  Award,
  FileText,
} from "lucide-react";

const useCases = [
  {
    title: "Educational Institutions",
    description:
      "Issue tamper-proof degrees, diplomas, and transcripts that employers can verify instantly.",
    icon: GraduationCap,
    color: "bg-black",
  },
  {
    title: "Corporate HR",
    description:
      "Verify candidate credentials, issue employment letters, and manage certifications securely.",
    icon: Briefcase,
    color: "bg-black",
  },
  {
    title: "Healthcare",
    description:
      "Issue and verify medical licenses, certifications, and patient records with privacy intact.",
    icon: Heart,
    color: "bg-black",
  },
  {
    title: "Government Agencies",
    description:
      "Digitize and authenticate official documents, permits, and legal certifications.",
    icon: Building,
    color: "bg-black",
  },
  {
    title: "Professional Bodies",
    description:
      "Issue membership certificates and professional accreditations with blockchain proof.",
    icon: Award,
    color: "bg-black",
  },
  {
    title: "Legal & Notary",
    description:
      "Create verifiable legal documents, contracts, and notarized certificates.",
    icon: FileText,
    color: "bg-black",
  },
];

export default function UseCases() {
  return (
    <section className="bg-black/5 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-black/10 px-4 py-1.5 text-sm font-medium text-black">
            Use Cases
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Built for Every Industry
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-black/60 sm:text-lg">
            From education to healthcare, CipherDocs empowers organizations to
            issue trusted documents
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <div
                key={useCase.title}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${useCase.color}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-black">
                  {useCase.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-black/60">
                  {useCase.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-black/80 group-hover:text-black">
                  <span>Learn more</span>
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
