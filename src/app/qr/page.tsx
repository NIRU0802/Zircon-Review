"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

const REVIEW_APP_URL = "https://zircon-review.vercel.app/";

export default function QRPage() {
    const [qrImage, setQrImage] = useState("");
    const [isGenerating, setIsGenerating] = useState(true);

    useEffect(() => {
        let mounted = true;

        const generateQR = async () => {
            try {
                setIsGenerating(true);

                const dataUrl = await QRCode.toDataURL(REVIEW_APP_URL, {
                    width: 1000,
                    margin: 4,
                    errorCorrectionLevel: "H",
                    color: {
                        dark: "#0f172a",
                        light: "#ffffff",
                    },
                });

                if (mounted) {
                    setQrImage(dataUrl);
                }
            } catch (error) {
                console.error("QR generation failed:", error);
            } finally {
                if (mounted) {
                    setIsGenerating(false);
                }
            }
        };

        generateQR();

        return () => {
            mounted = false;
        };

    }, []);

    return (
        <> <main className="qr-page"> <section className="qr-card">
            {/* Decorative background elements */} <div className="qr-glow qr-glow-one" /> <div className="qr-glow qr-glow-two" />

            {/* Brand Header */}
            <header className="qr-header">
                <div className="logo-wrapper">
                    <Image
                        src="/Logo.png"
                        alt="Zircon Dental & Implant Studio"
                        width={180}
                        height={70}
                        priority
                        className="logo"
                    />
                </div>

                <div className="brand-line">
                    <span />
                    <span className="brand-dot" />
                    <span />
                </div>

                <p className="eyebrow">YOUR EXPERIENCE MATTERS</p>

                <h1>
                    Share Your
                    <span> Experience.</span>
                </h1>

                <p className="intro">
                    We would love to hear about your visit to Zircon Dental &
                    Implant Studio.
                </p>
            </header>

            {/* QR CODE */}
            <section
                className="qr-section"
                aria-label="QR code for Zircon review page"
            >
                <div className="qr-frame">
                    {/* Decorative QR frame corners */}
                    <div className="corner corner-top-left" />
                    <div className="corner corner-top-right" />
                    <div className="corner corner-bottom-left" />
                    <div className="corner corner-bottom-right" />

                    {/* QR */}
                    <div className="qr-inner">
                        {isGenerating ? (
                            <div className="qr-loading">
                                <div className="loading-ring" />
                                <span>Preparing QR</span>
                            </div>
                        ) : qrImage ? (
                            <Image
                                src={qrImage}
                                alt="Scan to share your Zircon Dental & Implant Studio experience"
                                width={520}
                                height={520}
                                className="qr-image"
                                unoptimized
                                priority
                            />
                        ) : (
                            <div className="qr-error">
                                Unable to load QR code.
                                <br />
                                Please refresh the page.
                            </div>
                        )}
                    </div>
                </div>

                {/* Scan instruction */}
                <div className="scan-label">
                    <div className="scan-icon">
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>

                    <div>
                        <strong>Scan with your phone camera</strong>
                        <small>It only takes a moment</small>
                    </div>
                </div>
            </section>

            {/* Experience message */}
            <section className="review-message">
                <div className="gold-mark">✦</div>

                <div>
                    <h2>Tell us about your visit</h2>

                    <p>
                        Choose your treatment and experience. We&apos;ll help you
                        create a review in your preferred language.
                    </p>
                </div>
            </section>

            {/* Google Reviews */}
            <div className="google-box">
                <div className="google-icon">
                    <span>G</span>
                </div>

                <div className="google-copy">
                    <strong>Google Reviews</strong>
                    <span>Share your experience with us</span>
                </div>

                <div className="arrow">↗</div>
            </div>

            {/* Footer */}
            <footer className="qr-footer">
                <div className="footer-rule">
                    <span />
                    <span className="footer-diamond">◆</span>
                    <span />
                </div>

                <p className="thank-you">Thank you for choosing Zircon.</p>

                <p className="website">
                    zircondentalandimplantstudio.com
                </p>

                <p className="location">
                    DENTAL &amp; IMPLANT STUDIO · PUNE
                </p>
            </footer>
        </section>

            {/* Screen-only actions */}
            <div className="qr-actions no-print">
                <button
                    type="button"
                    className="print-button"
                    onClick={() => window.print()}
                >
                    <span className="print-icon">⎙</span>
                    Print QR Card
                </button>

                <a
                    href={REVIEW_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="test-link"
                >
                    Test Review Page ↗
                </a>
            </div>
        </main>

            <style jsx global>{`
    @import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap");

    :root {
      --zircon-primary: #0d9488;
      --zircon-primary-dark: #0f766e;
      --zircon-primary-light: #14b8a6;

      --zircon-navy: #0f172a;

      --zircon-gold: #d4a843;
      --zircon-gold-light: #ead38b;

      --zircon-text: #1e293b;
      --zircon-muted: #64748b;
      --zircon-border: #e2e8f0;

      --zircon-white: #ffffff;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      min-height: 100%;
    }

    body {
      font-family: "Inter", sans-serif;
      background: #eef5f5;
      color: var(--zircon-navy);
    }

    /* =========================================================
       PAGE
       ========================================================= */

    .qr-page {
      min-height: 100vh;
      padding: 32px 20px 50px;

      display: flex;
      flex-direction: column;
      align-items: center;

      position: relative;
      overflow: hidden;

      background:
        radial-gradient(
          circle at 10% 10%,
          rgba(13, 148, 136, 0.09),
          transparent 30%
        ),
        radial-gradient(
          circle at 90% 85%,
          rgba(212, 168, 67, 0.08),
          transparent 28%
        ),
        #f6fafa;
    }

    /* =========================================================
       MAIN CARD
       ========================================================= */

    .qr-card {
      width: min(100%, 680px);

      position: relative;
      overflow: hidden;

      background: rgba(255, 255, 255, 0.98);

      border: 1px solid rgba(13, 148, 136, 0.15);
      border-radius: 32px;

      padding: 48px 46px 42px;

      box-shadow:
        0 30px 80px rgba(15, 23, 42, 0.1),
        0 8px 24px rgba(13, 148, 136, 0.06);
    }

    .qr-card::before {
      content: "";

      position: absolute;

      top: 0;
      left: 0;
      right: 0;

      height: 5px;

      background: linear-gradient(
        90deg,
        var(--zircon-primary),
        var(--zircon-primary-light),
        var(--zircon-gold),
        var(--zircon-primary)
      );
    }

    /* =========================================================
       DECORATIVE BACKGROUND
       ========================================================= */

    .qr-glow {
      position: absolute;

      border-radius: 999px;

      pointer-events: none;

      filter: blur(1px);
    }

    .qr-glow-one {
      width: 260px;
      height: 260px;

      top: -170px;
      right: -120px;

      background: rgba(13, 148, 136, 0.07);
    }

    .qr-glow-two {
      width: 220px;
      height: 220px;

      bottom: -150px;
      left: -110px;

      background: rgba(212, 168, 67, 0.06);
    }

    /* =========================================================
       HEADER
       ========================================================= */

    .qr-header {
      position: relative;
      z-index: 2;

      text-align: center;
    }

    .logo-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;

      min-height: 72px;

      margin-bottom: 12px;
    }

    .logo {
      width: auto;
      height: auto;

      max-width: 180px;

      object-fit: contain;
    }

    .brand-line {
      display: flex;
      align-items: center;
      justify-content: center;

      gap: 8px;

      margin: 6px auto 18px;

      width: 110px;
    }

    .brand-line span:not(.brand-dot) {
      height: 1px;

      flex: 1;

      background: var(--zircon-gold);

      opacity: 0.7;
    }

    .brand-dot {
      width: 5px;
      height: 5px;

      border-radius: 50%;

      background: var(--zircon-gold);
    }

    .eyebrow {
      margin: 0 0 9px;

      color: var(--zircon-primary);

      font-size: 10px;
      line-height: 1.2;

      letter-spacing: 0.24em;

      font-weight: 800;
    }

    .qr-header h1 {
      margin: 0;

      font-family: "Playfair Display", serif;

      font-size: clamp(31px, 6vw, 43px);

      line-height: 1.08;

      letter-spacing: -0.025em;

      font-weight: 600;

      color: var(--zircon-navy);
    }

    .qr-header h1 span {
      display: block;

      color: var(--zircon-primary);
    }

    .intro {
      max-width: 470px;

      margin: 15px auto 0;

      color: var(--zircon-muted);

      font-size: 14px;

      line-height: 1.7;
    }

    /* =========================================================
       QR SECTION
       ========================================================= */

    .qr-section {
      position: relative;
      z-index: 2;

      display: flex;
      flex-direction: column;
      align-items: center;

      margin-top: 30px;
    }

    .qr-frame {
      width: min(100%, 410px);

      aspect-ratio: 1;

      position: relative;

      padding: 27px;

      display: flex;
      align-items: center;
      justify-content: center;

      background: #ffffff;

      border: 1px solid rgba(13, 148, 136, 0.2);

      border-radius: 28px;

      box-shadow:
        0 16px 40px rgba(15, 23, 42, 0.07),
        inset 0 0 0 8px rgba(13, 148, 136, 0.025);
    }

    .qr-frame::before {
      content: "";

      position: absolute;

      inset: 9px;

      border: 1px solid rgba(212, 168, 67, 0.35);

      border-radius: 21px;

      pointer-events: none;
    }

    .qr-inner {
      width: 100%;
      height: 100%;

      display: flex;
      align-items: center;
      justify-content: center;

      background: #ffffff;

      border-radius: 14px;

      overflow: hidden;
    }

    .qr-image {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: contain;

      image-rendering: pixelated;
    }

    /* =========================================================
ZIRCON LOGO — CENTER OF QR
========================================================= */

.qr-center-badge {
position: absolute;

left: 50%;
top: 50%;

width: 74px;
height: 74px;

transform: translate(-50%, -50%);

padding: 6px;

border-radius: 18px;

background: #ffffff;

box-shadow:
0 5px 18px rgba(15, 23, 42, 0.18),
0 0 0 2px rgba(13, 148, 136, 0.18);

display: flex;
align-items: center;
justify-content: center;

z-index: 20;
}

.qr-center-logo {
width: 100%;
height: 100%;

padding: 5px;

border-radius: 12px;

background: #ffffff;

display: flex;
align-items: center;
justify-content: center;

overflow: hidden;

border: 1px solid rgba(13, 148, 136, 0.18);
}

.center-logo-image {
display: block;

width: 100%;
height: auto;

max-width: 54px;
max-height: 42px;

object-fit: contain;

/* IMPORTANT:
Do NOT invert the Zircon logo.
*/
filter: none;
}

    /* =========================================================
       QR DECORATIVE CORNERS
       ========================================================= */

    .corner {
      position: absolute;

      width: 22px;
      height: 22px;

      border-color: var(--zircon-primary);

      border-style: solid;

      z-index: 4;
    }

    .corner-top-left {
      top: 16px;
      left: 16px;

      border-width: 2px 0 0 2px;

      border-radius: 7px 0 0 0;
    }

    .corner-top-right {
      top: 16px;
      right: 16px;

      border-width: 2px 2px 0 0;

      border-radius: 0 7px 0 0;
    }

    .corner-bottom-left {
      bottom: 16px;
      left: 16px;

      border-width: 0 0 2px 2px;

      border-radius: 0 0 0 7px;
    }

    .corner-bottom-right {
      bottom: 16px;
      right: 16px;

      border-width: 0 2px 2px 0;

      border-radius: 0 0 7px 0;
    }

    /* =========================================================
       LOADING
       ========================================================= */

    .qr-loading {
      display: flex;

      flex-direction: column;

      align-items: center;

      gap: 12px;

      color: var(--zircon-muted);

      font-size: 12px;

      font-weight: 600;
    }

    .loading-ring {
      width: 34px;
      height: 34px;

      border-radius: 50%;

      border: 3px solid #e2e8f0;

      border-top-color: var(--zircon-primary);

      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .qr-error {
      text-align: center;

      color: #b91c1c;

      font-size: 13px;

      line-height: 1.6;
    }

    /* =========================================================
       SCAN LABEL
       ========================================================= */

    .scan-label {
      margin-top: 18px;

      display: flex;
      align-items: center;

      gap: 12px;

      color: var(--zircon-navy);
    }

    .scan-label strong {
      display: block;

      font-size: 13px;

      font-weight: 700;
    }

    .scan-label small {
      display: block;

      margin-top: 3px;

      color: var(--zircon-muted);

      font-size: 11px;
    }

    .scan-icon {
      width: 32px;
      height: 32px;

      position: relative;

      border: 2px solid var(--zircon-primary);

      border-radius: 8px;
    }

    .scan-icon span {
      position: absolute;

      width: 6px;
      height: 6px;

      border: 1.5px solid var(--zircon-primary);
    }

    .scan-icon span:nth-child(1) {
      top: 4px;
      left: 4px;
    }

    .scan-icon span:nth-child(2) {
      top: 4px;
      right: 4px;
    }

    .scan-icon span:nth-child(3) {
      bottom: 4px;
      left: 4px;
    }

    .scan-icon span:nth-child(4) {
      bottom: 4px;
      right: 4px;
    }

    /* =========================================================
       EXPERIENCE MESSAGE
       ========================================================= */

    .review-message {
      position: relative;

      z-index: 2;

      display: flex;

      gap: 15px;

      align-items: flex-start;

      margin-top: 28px;

      padding: 20px 21px;

      border-radius: 19px;

      background: linear-gradient(
        135deg,
        rgba(13, 148, 136, 0.065),
        rgba(212, 168, 67, 0.045)
      );

      border: 1px solid rgba(13, 148, 136, 0.12);
    }

    .gold-mark {
      flex: 0 0 auto;

      width: 32px;
      height: 32px;

      display: flex;

      align-items: center;
      justify-content: center;

      border-radius: 10px;

      background: rgba(212, 168, 67, 0.13);

      color: var(--zircon-gold);

      font-size: 17px;
    }

    .review-message h2 {
      margin: 0;

      font-family: "Playfair Display", serif;

      font-size: 18px;

      font-weight: 600;

      color: var(--zircon-navy);
    }

    .review-message p {
      margin: 5px 0 0;

      color: var(--zircon-muted);

      font-size: 12px;

      line-height: 1.65;
    }

    /* =========================================================
       GOOGLE
       ========================================================= */

    .google-box {
      position: relative;

      z-index: 2;

      margin-top: 16px;

      padding: 15px 17px;

      display: flex;

      align-items: center;

      gap: 12px;

      border-radius: 16px;

      border: 1px solid #e2e8f0;

      background: #ffffff;
    }

    .google-icon {
      width: 35px;
      height: 35px;

      flex: 0 0 auto;

      display: flex;

      align-items: center;
      justify-content: center;

      border-radius: 10px;

      background: #f8fafc;

      border: 1px solid #e2e8f0;
    }

    .google-icon span {
      font-size: 19px;

      font-weight: 800;

      font-family: Arial, sans-serif;
    }

    .google-copy {
      flex: 1;

      min-width: 0;
    }

    .google-copy strong {
      display: block;

      font-size: 12px;

      font-weight: 800;

      color: var(--zircon-navy);
    }

    .google-copy span {
      display: block;

      margin-top: 3px;

      color: var(--zircon-muted);

      font-size: 11px;
    }

    .arrow {
      color: var(--zircon-primary);

      font-size: 20px;

      font-weight: 600;
    }

    /* =========================================================
       FOOTER
       ========================================================= */

    .qr-footer {
      position: relative;

      z-index: 2;

      text-align: center;

      margin-top: 27px;
    }

    .footer-rule {
      display: flex;

      align-items: center;

      gap: 10px;

      width: 150px;

      margin: 0 auto 13px;
    }

    .footer-rule span:not(.footer-diamond) {
      height: 1px;

      flex: 1;

      background: var(--zircon-border);
    }

    .footer-diamond {
      color: var(--zircon-gold);

      font-size: 7px;
    }

    .thank-you {
      margin: 0;

      font-family: "Cormorant Garamond", serif;

      color: var(--zircon-navy);

      font-size: 19px;

      font-weight: 600;
    }

    .website {
      margin: 6px 0 0;

      color: var(--zircon-primary);

      font-size: 10px;

      font-weight: 700;

      letter-spacing: 0.04em;
    }

    .location {
      margin: 5px 0 0;

      color: #94a3b8;

      font-size: 8px;

      font-weight: 700;

      letter-spacing: 0.18em;
    }

    /* =========================================================
       ACTIONS
       ========================================================= */

    .qr-actions {
      width: min(100%, 680px);

      margin-top: 20px;

      display: flex;

      flex-direction: column;

      align-items: center;

      gap: 11px;
    }

    .print-button {
      border: 0;

      cursor: pointer;

      min-height: 48px;

      padding: 0 23px;

      border-radius: 12px;

      display: inline-flex;

      align-items: center;
      justify-content: center;

      gap: 9px;

      background: var(--zircon-navy);

      color: #ffffff;

      font-family: "Inter", sans-serif;

      font-size: 12px;

      font-weight: 700;

      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.14);

      transition:
        transform 0.2s ease,
        background 0.2s ease;
    }

    .print-button:hover {
      transform: translateY(-1px);

      background: var(--zircon-primary-dark);
    }

    .print-icon {
      font-size: 18px;

      line-height: 1;
    }

    .test-link {
      color: var(--zircon-primary-dark);

      font-size: 11px;

      font-weight: 700;

      text-decoration: none;
    }

    .test-link:hover {
      text-decoration: underline;
    }

    /* =========================================================
       TABLET / MOBILE
       ========================================================= */

    @media (max-width: 700px) {
      .qr-page {
        padding: 15px 12px 35px;
      }

      .qr-card {
        padding: 37px 21px 32px;

        border-radius: 25px;
      }

      .logo-wrapper {
        min-height: 58px;
      }

      .logo {
        max-width: 155px;
      }

      .qr-header h1 {
        font-size: 32px;
      }

      .intro {
        font-size: 13px;

        line-height: 1.6;
      }

      .qr-section {
        margin-top: 24px;
      }

      .qr-frame {
        width: min(100%, 360px);

        padding: 24px;

        border-radius: 24px;
      }

      .center-logo-image {
        width: 47px;

        max-height: 39px;
      }

      .review-message {
        padding: 17px;
      }
    }

    @media (max-width: 480px) {
      .qr-page {
        padding: 9px 8px 25px;
      }

      .qr-card {
        padding: 31px 15px 28px;

        border-radius: 21px;
      }

      .eyebrow {
        font-size: 9px;

        letter-spacing: 0.19em;
      }

      .qr-header h1 {
        font-size: 29px;
      }

      .intro {
        max-width: 320px;

        font-size: 12px;
      }

      .qr-frame {
        width: min(100%, 330px);

        padding: 20px;
      }

      .qr-frame::before {
        inset: 7px;
      }

      .corner {
        width: 18px;
        height: 18px;
      }

      .corner-top-left,
      .corner-top-right {
        top: 13px;
      }

      .corner-bottom-left,
      .corner-bottom-right {
        bottom: 13px;
      }

      .corner-top-left,
      .corner-bottom-left {
        left: 13px;
      }

      .corner-top-right,
      .corner-bottom-right {
        right: 13px;
      }

      .qr-center-badge {
        width: 56px;
        height: 56px;

        padding: 4px;

        border-radius: 14px;
      }

      .scan-label {
        margin-top: 14px;
      }

      .scan-label strong {
        font-size: 12px;
      }

      .scan-label small {
        font-size: 10px;
      }

      .review-message {
        gap: 11px;

        margin-top: 22px;

        padding: 15px;
      }

      .gold-mark {
        width: 29px;
        height: 29px;

        font-size: 14px;
      }

      .review-message h2 {
        font-size: 16px;
      }

      .review-message p {
        font-size: 11px;
      }

      .google-box {
        padding: 13px;
      }

      .thank-you {
        font-size: 18px;
      }
    }

    /* =========================================================
       PRINT — A5 SINGLE PAGE
       ========================================================= */

    @media print {
      @page {
        size: A5 portrait;
        margin: 0;
      }

      html,
      body {
        width: 148mm;
        height: 210mm;

        min-height: 210mm;

        margin: 0 !important;
        padding: 0 !important;

        background: #ffffff !important;
      }

      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      .qr-page {
        width: 148mm;
        height: 210mm;

        min-height: 210mm;

        padding: 5mm;

        margin: 0;

        display: block;

        overflow: hidden;

        background: #ffffff !important;
      }

      .qr-card {
        width: 138mm;

        height: 200mm;

        min-height: 200mm;
        max-height: 200mm;

        margin: 0 auto;

        padding: 6mm 8mm 4mm;

        border-radius: 0;

        border: 0;

        box-shadow: none;

        overflow: hidden;

        break-inside: avoid;
        page-break-inside: avoid;
      }

      .qr-card::before {
        height: 1mm;
      }

      .qr-glow {
        display: none;
      }

      /* Logo */

      .logo-wrapper {
        min-height: 13mm;

        margin-bottom: 0;
      }

      .logo {
        max-width: 38mm;
      }

      /* Decorative line */

      .brand-line {
        margin: 0.5mm auto 2mm;

        width: 23mm;
      }

      .eyebrow {
        margin-bottom: 1mm;

        font-size: 5pt;

        line-height: 1.1;
      }

      /* Heading */

      .qr-header h1 {
        font-size: 20pt;

        line-height: 1.04;
      }

      .intro {
        max-width: 100mm;

        margin-top: 1.5mm;

        font-size: 7pt;

        line-height: 1.3;
      }

      /* QR */

      .qr-section {
        margin-top: 3.5mm;
      }

      .qr-frame {
        width: 78mm;
        height: 78mm;

        min-width: 78mm;
        min-height: 78mm;

        padding: 4mm;

        border-radius: 3.5mm;

        box-shadow: none;

        break-inside: avoid;
        page-break-inside: avoid;
      }

      .qr-frame::before {
        inset: 1.5mm;

        border-radius: 2.5mm;
      }

      .corner {
        width: 4mm;
        height: 4mm;
      }

      .corner-top-left,
      .corner-top-right {
        top: 2.5mm;
      }

      .corner-bottom-left,
      .corner-bottom-right {
        bottom: 2.5mm;
      }

      .corner-top-left,
      .corner-bottom-left {
        left: 2.5mm;
      }

      .corner-top-right,
      .corner-bottom-right {
        right: 2.5mm;
      }

      /* Center logo when printed */

      .qr-center-badge {
        width: 12mm;
        height: 12mm;

        padding: 1mm;

        border-radius: 2.5mm;

        box-shadow:
          0 0.8mm 1.5mm rgba(15, 23, 42, 0.15),
          0 0 0 0.3mm rgba(13, 148, 136, 0.16);
      }

      .qr-center-logo {
        border-radius: 1.8mm;
      }

      .center-logo-image {
        width: 9mm;

        max-height: 7mm;
      }

      /* Scan instruction */

      .scan-label {
        margin-top: 2mm;

        gap: 2mm;
      }

      .scan-icon {
        width: 6mm;
        height: 6mm;

        border-radius: 1.5mm;
      }

      .scan-icon span {
        width: 1.2mm;
        height: 1.2mm;
      }

      .scan-label strong {
        font-size: 6.5pt;

        line-height: 1.15;
      }

      .scan-label small {
        margin-top: 0.5mm;

        font-size: 5pt;

        line-height: 1.1;
      }

      /* Experience */

      .review-message {
        margin-top: 3mm;

        padding: 2.5mm 3mm;

        gap: 2.5mm;

        border-radius: 2.5mm;
      }

      .gold-mark {
        width: 6mm;
        height: 6mm;

        font-size: 8pt;

        border-radius: 1.5mm;
      }

      .review-message h2 {
        font-size: 9pt;

        line-height: 1.1;
      }

      .review-message p {
        margin-top: 0.7mm;

        font-size: 5.5pt;

        line-height: 1.25;
      }

      /* Google */

      .google-box {
        margin-top: 2mm;

        padding: 2mm 2.5mm;

        gap: 2mm;

        border-radius: 2mm;
      }

      .google-icon {
        width: 6mm;
        height: 6mm;

        border-radius: 1.5mm;
      }

      .google-icon span {
        font-size: 9pt;
      }

      .google-copy strong {
        font-size: 5.8pt;

        line-height: 1.1;
      }

      .google-copy span {
        margin-top: 0.4mm;

        font-size: 5pt;

        line-height: 1.1;
      }

      .arrow {
        font-size: 10pt;
      }

      /* Footer */

      .qr-footer {
        margin-top: 2.5mm;

        break-inside: avoid;
        page-break-inside: avoid;
      }

      .footer-rule {
        width: 30mm;

        margin-bottom: 1.2mm;
      }

      .thank-you {
        font-size: 9pt;

        line-height: 1.05;
      }

      .website {
        margin-top: 0.6mm;

        font-size: 5pt;

        line-height: 1.1;
      }

      .location {
        margin-top: 0.5mm;

        font-size: 4pt;

        line-height: 1.1;
      }

      .no-print {
        display: none !important;
      }

      .qr-header,
      .qr-section,
      .review-message,
      .google-box,
      .qr-footer {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }

    /* =========================================================
       REDUCED MOTION
       ========================================================= */

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;

        animation-iteration-count: 1 !important;

        transition-duration: 0.01ms !important;
      }
    }
  `}</style>
        </>
    );
}
