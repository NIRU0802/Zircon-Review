"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Heart,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const GOOGLE_REVIEW_URL =
  "https://g.page/r/CWWwNFbSBA_wEAE/review";

type Step = 0 | 1 | 2 | 3;
type Language = "English" | "Hindi" | "Marathi";

const progressLabels = [
  "Service",
  "Experience",
  "Language",
  "Review",
];

const services = [
  {
    name: "Dental Implants",
    description: "Implant consultation or treatment",
    icon: "implant",
  },
  {
    name: "Root Canal",
    description: "Root canal treatment",
    icon: "tooth",
  },
  {
    name: "Cleaning",
    description: "Teeth cleaning or hygiene",
    icon: "clean",
  },
  {
    name: "Teeth Whitening",
    description: "Whitening treatment",
    icon: "sparkle",
  },
  {
    name: "Braces / Aligners",
    description: "Orthodontic treatment",
    icon: "braces",
  },
  {
    name: "Children's Dentistry",
    description: "Dental care for children",
    icon: "child",
  },
  {
    name: "Dental Consultation",
    description: "General dental consultation",
    icon: "consultation",
  },
  {
    name: "Other",
    description: "Another dental service",
    icon: "other",
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

const languages = [
  {
    name: "English" as Language,
    native: "English",
  },
  {
    name: "Hindi" as Language,
    native: "हिन्दी",
  },
  {
    name: "Marathi" as Language,
    native: "मराठी",
  },
];

function ServiceIcon({ type }: { type: string }) {
  if (type === "sparkle") {
    return <Sparkles size={21} strokeWidth={1.8} />;
  }

  if (type === "child") {
    return <Heart size={21} strokeWidth={1.8} />;
  }

  if (type === "consultation") {
    return <Stethoscope size={21} strokeWidth={1.8} />;
  }

  return <span className="service-icon-tooth">✦</span>;
}

export default function Home() {
  const [step, setStep] = useState<Step>(0);
  const [selectedService, setSelectedService] = useState("");
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>(
    [],
  );
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>("English");
  const [reviews, setReviews] = useState<string[]>([]);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [googleOpened, setGoogleOpened] = useState(false);

  const currentExperiences =
    experiencesByService[selectedService] ?? [];

  const selectedReview =
    reviews[selectedReviewIndex] ?? "";

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const selectService = (service: string) => {
    setSelectedService(service);
    setSelectedExperiences([]);
    setError("");
  };

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

  const goToExperience = () => {
    if (!selectedService) {
      setError("Please select the service that matches your visit.");
      return;
    }

    setError("");
    setStep(1);
    scrollToTop();

  };

  const goToLanguage = () => {
    if (selectedExperiences.length === 0) {
      setError("Please select at least one thing that felt true.");
      return;
    }


    setError("");
    setStep(2);
    scrollToTop();

  };

  const generateReview = async () => {
    if (!selectedService) {
      setError("Please select your service.");
      return;
    }

    if (selectedExperiences.length === 0) {
      setError("Please select at least one experience.");
      return;
    }

    setError("");
    setIsGenerating(true);
    setCopied(false);
    setGoogleOpened(false);

    try {
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service: selectedService,
          experiences: selectedExperiences,
          language: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Could not create the review drafts.",
        );
      }

      if (
        !Array.isArray(data?.reviews) ||
        data.reviews.length !== 3 ||
        data.reviews.some(
          (review: unknown) =>
            typeof review !== "string" || !review.trim(),
        )
      ) {
        throw new Error(
          "The review drafts were not returned correctly.",
        );
      }

      setReviews(
        data.reviews.map((review: string) => review.trim()),
      );
      setSelectedReviewIndex(0);
      setStep(3);
      scrollToTop();
    } catch (err) {
      console.error("[Review Generator]", err);

      setError(
        err instanceof Error && err.message
          ? err.message
          : "We could not create the review drafts. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }

  };

  const goBack = () => {
    setError("");
    setCopied(false);
    setGoogleOpened(false);


    if (step === 1) {
      setStep(0);
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }

    scrollToTop();


  };

  const updateSelectedReview = (value: string) => {
    setReviews((current) =>
      current.map((review, index) =>
        index === selectedReviewIndex ? value : review,
      ),
    );

    setCopied(false);
    setGoogleOpened(false);

  };

  const copyReview = async () => {
    if (!selectedReview.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedReview.trim());

      setCopied(true);
      setGoogleOpened(false);

      window.setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch {
      setError(
        "We could not copy the review. Please select and copy the text manually.",
      );
    }

  };

  const copyAndOpenGoogle = async () => {
    if (!selectedReview.trim()) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedReview.trim());

      setCopied(true);
      setError("");

      window.setTimeout(() => {
        window.open(
          GOOGLE_REVIEW_URL,
          "_blank",
          "noopener,noreferrer",
        );

        setGoogleOpened(true);
      }, 150);
    } catch {
      setError(
        "We could not copy the review. Please copy it manually before opening Google.",
      );
    }

  };

  const generateNewDrafts = async () => {
    await generateReview();
  };

  const startAgain = () => {
    setStep(0);
    setSelectedService("");
    setSelectedExperiences([]);
    setSelectedLanguage("English");
    setReviews([]);
    setSelectedReviewIndex(0);
    setIsGenerating(false);
    setError("");
    setCopied(false);
    setGoogleOpened(false);
    scrollToTop();
  };

  return (<main className="review-page"> <div className="review-background-orb review-background-orb-one" /> <div className="review-background-orb review-background-orb-two" />
    <div className="review-shell">
      <header className="review-header">
        <div className="review-header-inner">
          <div className="review-brand">
            <Image
              src="/Logo.png"
              alt="Zircon Dental & Implant Studio"
              width={180}
              height={60}
              priority
              className="review-logo"
            />
          </div>

          <div className="progress-area">
            <div className="progress-label-row">
              <span className="progress-current">
                {progressLabels[step]}
              </span>
              <span className="progress-count">
                {step + 1} / 4
              </span>
            </div>

            <div className="progress-bars">
              {progressLabels.map((label, index) => (
                <span
                  key={label}
                  className={`progress-bar ${index <= step ? "active" : ""
                    }`}
                  aria-label={`${label}${index <= step ? " completed" : ""
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="review-content">
        {step === 0 && (
          <>
            <div className="review-intro">
              <p className="review-kicker">Step 1 of 4</p>

              <h1 className="review-title">
                What did you visit us for?
              </h1>

              <p className="review-description">
                Choose the service that best matches your visit.
              </p>
            </div>

            <section className="review-section">
              <div className="review-section-header">
                <div>
                  <p className="review-eyebrow">
                    Your visit
                  </p>

                  <h2 className="review-section-title">
                    Select your service
                  </h2>
                </div>
              </div>

              <div className="service-grid">
                {services.map((service) => {
                  const isSelected =
                    selectedService === service.name;

                  return (
                    <button
                      key={service.name}
                      type="button"
                      className={`service-card ${isSelected ? "selected" : ""
                        }`}
                      onClick={() =>
                        selectService(service.name)
                      }
                      aria-pressed={isSelected}
                    >
                      <span className="service-icon">
                        <ServiceIcon type={service.icon} />
                      </span>

                      <span className="service-text">
                        <span className="service-name">
                          {service.name}
                        </span>

                        <span className="service-description">
                          {service.description}
                        </span>
                      </span>

                      <span className="service-check">
                        {isSelected && (
                          <Check
                            size={15}
                            strokeWidth={3}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {error && (
              <div className="review-error" role="alert">
                {error}
              </div>
            )}

            <div className="navigation-actions navigation-actions-single">
              <button
                type="button"
                className="continue-button"
                onClick={goToExperience}
              >
                Continue
                <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="review-intro">
              <p className="review-kicker">Step 2 of 4</p>

              <h1 className="review-title">
                What felt true about your visit?
              </h1>

              <p className="review-description">
                Select only the things that genuinely reflect
                your experience. You can choose more than one.
              </p>
            </div>

            <section className="review-section">
              <div className="review-section-header">
                <div>
                  <p className="review-eyebrow">
                    Your experience
                  </p>

                  <h2 className="review-section-title">
                    What stood out to you?
                  </h2>
                </div>

                <p className="review-selection-count">
                  {selectedExperiences.length} selected
                </p>
              </div>

              <div className="experience-list">
                {currentExperiences.map((experience) => {
                  const isSelected =
                    selectedExperiences.includes(
                      experience,
                    );

                  return (
                    <button
                      key={experience}
                      type="button"
                      className={`experience-card ${isSelected ? "selected" : ""
                        }`}
                      onClick={() =>
                        toggleExperience(experience)
                      }
                      aria-pressed={isSelected}
                    >
                      <span className="experience-check">
                        {isSelected && (
                          <Check
                            size={16}
                            strokeWidth={3}
                          />
                        )}
                      </span>

                      <span className="experience-text">
                        {experience}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {error && (
              <div className="review-error" role="alert">
                {error}
              </div>
            )}

            <div className="navigation-actions">
              <button
                type="button"
                className="back-button"
                onClick={goBack}
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                className="continue-button"
                onClick={goToLanguage}
              >
                Continue
                <ArrowRight size={17} />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="review-intro">
              <p className="review-kicker">Step 3 of 4</p>

              <h1 className="review-title">
                Which language feels natural to you?
              </h1>

              <p className="review-description">
                Your review drafts will be written in the
                language you choose.
              </p>
            </div>

            <section className="review-section language-section">
              <div className="review-section-header">
                <div>
                  <p className="review-eyebrow">
                    Writing language
                  </p>

                  <h2 className="review-section-title">
                    Choose your language
                  </h2>
                </div>
              </div>

              <div className="language-list">
                {languages.map((language) => {
                  const isSelected =
                    selectedLanguage === language.name;

                  return (
                    <button
                      key={language.name}
                      type="button"
                      className={`language-card ${isSelected ? "selected" : ""
                        }`}
                      onClick={() =>
                        setSelectedLanguage(
                          language.name,
                        )
                      }
                      aria-pressed={isSelected}
                    >
                      <span className="language-radio">
                        {isSelected && (
                          <span className="language-radio-dot" />
                        )}
                      </span>

                      <span className="language-name">
                        {language.name}
                      </span>

                      <span className="language-native">
                        {language.native}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {error && (
              <div className="review-error" role="alert">
                {error}
              </div>
            )}

            <div className="navigation-actions">
              <button
                type="button"
                className="back-button"
                onClick={goBack}
                disabled={isGenerating}
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                className="continue-button generate-button"
                onClick={generateReview}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2
                      size={18}
                      className="review-spinner"
                    />
                    Creating drafts...
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    Create my drafts
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="review-intro review-intro-final">
              <div className="review-final-badge">
                <Sparkles size={15} />
                Your drafts are ready
              </div>

              <p className="review-kicker">Step 4 of 4</p>

              <h1 className="review-title">
                Make it sound like you.
              </h1>

              <p className="review-description">
                Choose the draft that feels closest to your
                experience. You can edit it before sharing.
              </p>
            </div>

            <section className="final-review-section">
              <div className="final-review-heading">
                <div>
                  <p className="review-eyebrow">
                    Your review
                  </p>

                  <h2 className="review-section-title">
                    Choose a starting point
                  </h2>
                </div>

                <span className="draft-count">
                  3 drafts
                </span>
              </div>

              <div className="draft-tabs">
                {reviews.map((_, index) => {
                  const isSelected =
                    selectedReviewIndex === index;

                  return (
                    <button
                      key={index}
                      type="button"
                      className={`draft-tab ${isSelected ? "selected" : ""
                        }`}
                      onClick={() => {
                        setSelectedReviewIndex(index);
                        setCopied(false);
                        setGoogleOpened(false);
                      }}
                    >
                      <span className="draft-tab-number">
                        {index + 1}
                      </span>

                      <span className="draft-tab-content">
                        <span className="draft-tab-title">
                          Draft {index + 1}
                        </span>

                        <span className="draft-tab-caption">
                          {isSelected
                            ? "Selected"
                            : "View draft"}
                        </span>
                      </span>

                      {isSelected && (
                        <span className="draft-tab-check">
                          <Check
                            size={15}
                            strokeWidth={3}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="review-editor-card">
                <div className="review-editor-top">
                  <div className="review-editor-label">
                    <span className="review-editor-icon">
                      <Heart
                        size={16}
                        fill="currentColor"
                      />
                    </span>

                    <span>
                      Your words
                    </span>
                  </div>

                  <span className="review-edit-hint">
                    Editable
                  </span>
                </div>

                <textarea
                  className="review-editor"
                  value={selectedReview}
                  onChange={(event) =>
                    updateSelectedReview(
                      event.target.value,
                    )
                  }
                  aria-label="Review draft"
                  spellCheck
                />

                <div className="review-editor-bottom">
                  <span>
                    Edit anything you want before sharing.
                  </span>

                  <span>
                    {selectedReview.trim().length} characters
                  </span>
                </div>
              </div>

              {error && (
                <div className="review-error" role="alert">
                  {error}
                </div>
              )}

              {copied && (
                <div
                  className="review-success"
                  role="status"
                >
                  <Check size={17} strokeWidth={3} />
                  Review copied to your clipboard.
                </div>
              )}

              {googleOpened && (
                <div
                  className="review-success"
                  role="status"
                >
                  <Check size={17} strokeWidth={3} />
                  Google Reviews opened. Paste your review
                  there and submit it when ready.
                </div>
              )}

              <div className="review-primary-action">
                <button
                  type="button"
                  className="google-review-button"
                  onClick={copyAndOpenGoogle}
                  disabled={!selectedReview.trim()}
                >
                  <span className="google-review-button-icon">
                    <Copy size={18} />
                  </span>

                  <span className="google-review-button-text">
                    <span>
                      Copy Review &amp; Open Google
                    </span>

                    <small>
                      Your review will be copied first
                    </small>
                  </span>

                  <ExternalLink size={17} />
                </button>
              </div>

              <div className="review-secondary-actions">
                <button
                  type="button"
                  className="review-secondary-button"
                  onClick={copyReview}
                  disabled={!selectedReview.trim()}
                >
                  <Copy size={17} />
                  Copy Draft Only
                </button>

                <button
                  type="button"
                  className="review-secondary-button"
                  onClick={generateNewDrafts}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2
                      size={17}
                      className="review-spinner"
                    />
                  ) : (
                    <RefreshCw size={17} />
                  )}

                  Generate New Drafts
                </button>
              </div>

              <div className="review-final-note">
                <span className="review-final-note-icon">
                  <Heart
                    size={15}
                    fill="currentColor"
                  />
                </span>

                <p>
                  Your review is yours. Edit it, approve it,
                  and share only if it reflects your actual
                  experience.
                </p>
              </div>
            </section>

            <div className="final-navigation">
              <button
                type="button"
                className="back-button"
                onClick={goBack}
                disabled={isGenerating}
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                className="start-again-button"
                onClick={startAgain}
                disabled={isGenerating}
              >
                <RotateCcw size={16} />
                Start again
              </button>
            </div>
          </>
        )}
      </div>

      <footer className="review-footer">
        <div className="review-footer-line" />

        <p className="review-footer-text">
          Your review is yours to edit, approve and share.
        </p>

        <p className="review-footer-brand">
          Zircon Dental &amp; Implant Studio
        </p>
      </footer>
    </div>
  </main>
  );
}