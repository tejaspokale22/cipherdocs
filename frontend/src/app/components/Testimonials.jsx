"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "CipherDocs has transformed how we issue academic credentials. Our graduates can now share verified degrees with employers worldwide in seconds.",
    author: "Dr. Sarah Chen",
    role: "Registrar, Stanford University",
    avatar: "SC",
  },
  {
    quote:
      "We reduced credential verification time from weeks to minutes. The blockchain integration gives us and our partners complete confidence in document authenticity.",
    author: "Michael Roberts",
    role: "VP of HR, TechCorp Global",
    avatar: "MR",
  },
  {
    quote:
      "The QR verification feature is a game-changer. Patients and healthcare providers can instantly verify medical certifications without any paperwork.",
    author: "Dr. Emily Watson",
    role: "Chief Medical Officer, HealthFirst",
    avatar: "EW",
  },
  {
    quote:
      "As a government agency, security is paramount. CipherDocs provides the transparency and immutability we need for official documentation.",
    author: "James Anderson",
    role: "Director, Digital Services Agency",
    avatar: "JA",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-600">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Trusted by Industry Leaders
          </h2>
        </div>

        <div className="relative mx-auto mt-10 max-w-4xl">
          {/* Main testimonial */}
          <div className="relative overflow-hidden rounded-3xl bg-black p-8 sm:p-12">
            <Quote className="absolute right-8 top-8 h-24 w-24 text-white/5" />

            <div className="relative">
              <p className="text-lg leading-relaxed text-white/90 sm:text-xl">
                &quot;{testimonials[currentIndex].quote}&quot;
              </p>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-lg font-semibold text-white">
                  {testimonials[currentIndex].avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {testimonials[currentIndex].author}
                  </p>
                  <p className="text-sm text-white/60">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prevTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black transition-colors hover:bg-black/10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-green-500"
                      : "w-2 bg-black/20 hover:bg-black/40"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black transition-colors hover:bg-black/10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
