"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  RotateCcw,
} from "lucide-react";

const GOOGLE_REVIEW_URL =
  "https://g.page/r/CWWwNFbSBA_wEAE/review";

const services = [
  {
    name: "Dental Implants",
    description: "Implant consultation or treatment",
    icon: "/icons/implant.png",
  },
  {
    name: "Root Canal",
    description: "Root canal treatment",
    icon: "/icons/root-canal.png",
  },
  {
    name: "Cleaning",
    description: "Teeth cleaning or hygiene",
    icon: "/icons/cleaning.png",
  },
  {
    name: "Teeth Whitening",
    description: "Whitening treatment",
    icon: "/icons/tooth-whitening.png",
  },
  {
    name: "Braces / Aligners",
    description: "Orthodontic treatment",
    icon: "/icons/braces.png",
  },
  {
    name: "Children's Dentistry",
    description: "Dental care for children",
    icon: "/icons/baby-teeth.png",
  },
  {
    name: "Dental Consultation",
    description: "General dental consultation",
    icon: "/icons/dental-check.png",
  },
  {
    name: "Other",
    description: "Another dental service",
    icon: "/icons/clinic.png",
  },
];

const experiencesByService: Record<string, string[]> = {
  "Dental Implants": [
    "Implant treatment options were explained clearly",
    "I understood the treatment plan and next steps",
    "My questions were answered",
    "I felt comfortable discussing my concerns",
    "The visit was well organised",
    "The follow-up process was explained clearly",
  ],

  "Root Canal": [
    "The treatment process was explained clearly",
    "I understood what to expect during treatment",
    "My questions were answered",
    "I felt comfortable during the visit",
    "The treatment plan was easy to understand",
    "The after-care instructions were clear",
  ],

  Cleaning: [
    "The cleaning procedure was explained clearly",
    "I understood the condition of my teeth",
    "My questions were answered",
    "I felt comfortable during the cleaning",
    "The visit was well organised",
    "The after-care guidance was clear",
  ],

  "Teeth Whitening": [
    "The whitening process was explained clearly",
    "I understood what to expect from the treatment",
    "I felt comfortable during the visit",
    "The treatment process was well explained",
    "The after-care guidance was clear",
  ],

  "Braces / Aligners": [
    "The treatment options were explained clearly",
    "I understood the proposed treatment plan",
    "The next steps were clearly explained",
    "My questions were answered",
    "I felt comfortable discussing my concerns",
    "The follow-up process was explained clearly",
  ],

  "Children's Dentistry": [
    "The treatment was explained clearly",
    "My child felt comfortable during the visit",
    "The dentist communicated well with my child",
    "My concerns were addressed",
    "The staff were welcoming",
    "The after-care instructions were clear",
  ],

  "Dental Consultation": [
    "My dental concerns were listened to",
    "The treatment options were explained clearly",
    "I understood the advice I received",
    "My questions were answered",
    "I felt comfortable discussing my concerns",
    "The next steps were clear",
  ],

  Other: [
    "My treatment was explained clearly",
    "I understood the available options",
    "My questions were answered",
    "I felt comfortable during my visit",
    "The visit was well organised",
    "The next steps were clear",
  ],
};

type Language = "English" | "Hindi" | "Marathi";

const languages: { name: Language; native: string }[] = [
  {
    name: "English",
    native: "English",
  },
  {
    name: "Hindi",
    native: "हिन्दी",
  },
  {
    name: "Marathi",
    native: "मराठी",
  },
];

function ServiceIcon({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={30}
      height={30}
      className="service-icon-image h-[30px] w-[30px] object-contain"
    />
  );
}

export default function HomePage() {
  const [step, setStep] = useState(0);

  const [selectedService, setSelectedService] = useState("");
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>(
    [],
  );

  const [language, setLanguage] = useState<Language>("English");

  const [reviews, setReviews] = useState<string[]>([]);
  const [selectedReview, setSelectedReview] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const experiences = selectedService
    ? experiencesByService[selectedService] ?? experiencesByService.Other
    : [];

  const toggleExperience = (experience: string) => {
    setError("");

    setSelectedExperiences((current) => {
      if (current.includes(experience)) {
        return current.filter((item) => item !== experience);
      }

      if (current.length >= 6) {
        return current;
      }

      return [...current, experience];
    });
  };

  const goBack = () => {
    setError("");

    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    if (step === 1) {
      setStep(0);
    }
  };

  const createReviews = async () => {
    if (!selectedService) {
      setError("Please select a service.");
      return;
    }

    if (
      selectedExperiences.length < 1 ||
      selectedExperiences.length > 6
    ) {
      setError("Please select at least one experience.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service: selectedService,
          experiences: selectedExperiences,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Could not generate your reviews.",
        );
      }

      if (
        !Array.isArray(data?.reviews) ||
        data.reviews.length !== 3
      ) {
        throw new Error("Could not generate three review versions.");
      }

      setReviews(data.reviews);
      setSelectedReview(0);
      setStep(3);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate your reviews. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const copyAndOpenGoogle = async () => {
    const review = reviews[selectedReview]?.trim();

    if (!review) {
      setError("Please enter your review first.");
      return;
    }

    setError("");

    try {
      await navigator.clipboard.writeText(review);

      window.open(
        GOOGLE_REVIEW_URL,
        "_blank",
        "noopener,noreferrer",
      );
    } catch {
      setError("Could not copy the review. Please try again.");
    }
  };

  const startOver = () => {
    setStep(0);
    setSelectedService("");
    setSelectedExperiences([]);
    setLanguage("English");
    setReviews([]);
    setSelectedReview(0);
    setError("");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-5 sm:px-6 sm:py-7">
      <div className="mx-auto w-full max-w-[720px]">
        
{/* NAVBAR */}
<header className="mb-8 flex items-center justify-between">
  <div className="flex items-center">
    <Image
      src="/Logo.png"
      alt="Zircon Dental & Implant Studio"
      width={190}
      height={60}
      className="h-auto w-[165px] object-contain sm:w-[190px]"
      priority
    />
  </div>

  <div className="rounded-full border border-[#0d9488]/15 bg-[#0d9488]/5 px-3.5 py-2 text-[11px] font-medium text-[#0d9488]">
    Your experience matters
  </div>
</header>

        {/* PROGRESS */}
        <div className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[17px] font-semibold text-[#0f172a] sm:text-[18px]">
              Service {step + 1} / 4
            </span>

            <span className="text-[11px] font-medium text-slate-400">
              {Math.round(((step + 1) / 4) * 100)}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#0d9488] transition-all duration-300"
              style={{
                width: `${((step + 1) / 4) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* MAIN CARD */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-7">

          {/* STEP 1 */}
          {step === 0 && (
            <>
              <div className="mb-6">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#0d9488]">
                  Step 1 of 4
                </p>

                <h1 className="font-[var(--font-playfair)] text-[28px] font-semibold leading-tight text-[#0f172a]">
                  What did you visit us for?
                </h1>

                <p className="mt-2 text-[15px] leading-6 text-slate-500">
                  Choose the service that best matches your visit.
                </p>
              </div>

              <div className="mb-5">
                <p className="mb-3 text-sm font-semibold text-slate-800">
                  Your visit
                </p>

                <p className="mb-3 text-xs font-medium text-slate-400">
                  Select your service
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((service) => {
                    const isSelected =
                      selectedService === service.name;

                    return (
                      <button
                        key={service.name}
                        type="button"
                        onClick={() => {
                          setSelectedService(service.name);
                          setSelectedExperiences([]);
                          setError("");
                        }}
                        className={`flex min-h-[78px] items-center gap-3.5 rounded-xl border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-[#0d9488] bg-[#0d9488]/5 shadow-sm"
                            : "border-slate-200 bg-white hover:border-[#0d9488]/40 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            isSelected
                              ? "bg-white ring-1 ring-[#0d9488]/20"
                              : "bg-slate-50"
                          }`}
                        >
                          <ServiceIcon src={service.icon} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-[15px] font-semibold leading-5 ${
                              isSelected
                                ? "text-[#0f766e]"
                                : "text-slate-800"
                            }`}
                          >
                            {service.name}
                          </span>

                          <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                            {service.description}
                          </span>
                        </span>

                        {isSelected && (
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0d9488] text-white">
                            <Check size={13} strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={!selectedService}
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d9488] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={goBack}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-[#0d9488]"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <div className="mb-5">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#0d9488]">
                  Step 2 of 4
                </p>

                <h2 className="font-[var(--font-playfair)] text-[27px] font-semibold leading-tight text-[#0f172a]">
                  What stood out to you?
                </h2>

                <p className="mt-2 text-[15px] leading-6 text-slate-500">
                  Select the things that reflect your actual
                  experience.
                </p>
              </div>

              <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                  Selected service
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedService}
                </p>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                {experiences.map((experience) => {
                  const isSelected =
                    selectedExperiences.includes(experience);

                  return (
                    <button
                      key={experience}
                      type="button"
                      onClick={() =>
                        toggleExperience(experience)
                      }
                      className={`flex min-h-[76px] items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-[#0d9488] bg-[#0d9488]/5"
                          : "border-slate-200 bg-white hover:border-[#0d9488]/40 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-[#0d9488] bg-[#0d9488] text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <Check size={15} strokeWidth={2.5} />
                      </span>

                      <span
                        className={`text-sm leading-5 ${
                          isSelected
                            ? "font-medium text-[#0f766e]"
                            : "text-slate-700"
                        }`}
                      >
                        {experience}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Choose up to 6
                </span>

                <span className="text-xs font-medium text-[#0d9488]">
                  {selectedExperiences.length} selected
                </span>
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={selectedExperiences.length === 0}
                onClick={() => {
                  setError("");
                  setStep(2);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d9488] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                Continue
                <ArrowRight size={17} />
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === 2 && (
            <>
              <button
                type="button"
                onClick={goBack}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-[#0d9488]"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              <div className="mb-6">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#0d9488]">
                  Step 3 of 4
                </p>

                <h2 className="font-[var(--font-playfair)] text-[27px] font-semibold leading-tight text-[#0f172a]">
                  What language would you like?
                </h2>

                <p className="mt-2 text-[15px] leading-6 text-slate-500">
                  Your review will be written in your selected
                  language.
                </p>
              </div>

              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {languages.map((item) => {
                  const isSelected =
                    language === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setLanguage(item.name);
                        setError("");
                      }}
                      className={`rounded-xl border px-4 py-5 text-center transition-all ${
                        isSelected
                          ? "border-[#0d9488] bg-[#0d9488]/5"
                          : "border-slate-200 bg-white hover:border-[#0d9488]/40 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`block text-sm font-semibold ${
                          isSelected
                            ? "text-[#0f766e]"
                            : "text-slate-800"
                        }`}
                      >
                        {item.name}
                      </span>

                      <span className="mt-1 block text-sm text-slate-500">
                        {item.native}
                      </span>
                    </button>
                  );
                })}
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={createReviews}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d9488] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f766e] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating your reviews...
                  </>
                ) : (
                  <>
                    Create my reviews
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </>
          )}

          {/* STEP 4 */}
          {step === 3 && (
            <>
              <div className="mb-4">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0d9488]">
                  Your reviews
                </p>

                <h2 className="font-[var(--font-playfair)] text-[23px] font-semibold leading-tight text-[#0f172a]">
                  Choose your review
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Pick the version that sounds most like you.
                  You can edit it before posting.
                </p>
              </div>

              <div className="mb-3 flex gap-2">
                {reviews.map((_, index) => {
                  const isSelected =
                    selectedReview === index;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedReview(index);
                        setError("");
                      }}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        isSelected
                          ? "border-[#0d9488] bg-[#0d9488] text-white"
                          : "border-slate-200 bg-white text-slate-500 hover:border-[#0d9488]/40 hover:text-[#0d9488]"
                      }`}
                    >
                      Version {index + 1}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={reviews[selectedReview] ?? ""}
                onChange={(event) => {
                  const value = event.target.value;

                  setReviews((current) =>
                    current.map((review, index) =>
                      index === selectedReview
                        ? value
                        : review,
                    ),
                  );

                  setError("");
                }}
                className="min-h-[170px] w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-[15px] leading-6 text-slate-700 outline-none transition focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/10"
                placeholder="Your review..."
              />

              {error && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={copyAndOpenGoogle}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d9488] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f766e]"
              >
                <Copy size={17} />
                Copy &amp; Open Google Review
                <ExternalLink size={16} />
              </button>

              <button
                type="button"
                onClick={startOver}
                className="mx-auto mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-[#0d9488]"
              >
                <RotateCcw size={13} />
                Start over
              </button>
            </>
          )}
        </section>

        {/* FOOTER */}
        <footer className="px-2 py-5 text-center">
          <p className="text-xs leading-5 text-slate-400">
            Your review is yours to edit, approve and share.
          </p>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Zircon Dental &amp; Implant Studio
          </p>
        </footer>
      </div>
    </main>
  );
}