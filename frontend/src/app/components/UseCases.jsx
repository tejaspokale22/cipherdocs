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
    <section className="bg-black/5 py-10 xs:py-14 sm:py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-black/10 px-3 py-1 text-xs xs:px-4 xs:py-1.5 xs:text-sm font-medium text-black">
            Use Cases
          </span>
          <h2 className="mt-3 xs:mt-4 text-2xl xs:text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Built for Every Industry
          </h2>
          <p className="mx-auto mt-3 xs:mt-4 max-w-xl xs:max-w-2xl text-xs xs:text-base text-black/60 sm:text-lg">
            From education to healthcare, CipherDocs empowers organizations to
            issue trusted documents
          </p>
        </div>

        <div className="mt-10 xs:mt-16 grid gap-4 xs:gap-6 xs:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <div
                key={useCase.title}
                className="group relative overflow-hidden rounded-2xl bg-white p-4 xs:p-6 shadow-sm transition-all"
              >
                <div
                  className={`inline-flex h-10 w-10 xs:h-12 xs:w-12 items-center justify-center rounded-xl ${useCase.color}`}
                >
                  <Icon className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                </div>
                <h3 className="mt-3 xs:mt-4 text-base xs:text-lg font-semibold text-black">
                  {useCase.title}
                </h3>
                <p className="mt-1 xs:mt-2 text-xs xs:text-sm leading-relaxed text-black/60">
                  {useCase.description}
                </p>
                <div className="mt-3 xs:mt-4 flex items-center text-xs xs:text-sm font-medium text-black/80 group-hover:text-black">
                  <span>Learn more</span>
                  <svg
                    className="ml-1 h-3 w-3 xs:h-4 xs:w-4 transition-transform group-hover:translate-x-1"
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
