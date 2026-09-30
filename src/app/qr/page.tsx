import Image from "next/image";
import QRCode from "qrcode";
import PrintButton from "./PrintButton";
import "./qr.css";

const REVIEW_APP_URL = "https://zircon-review.vercel.app/";

export const dynamic = "force-static";

async function generateQRCode() {
  return QRCode.toString(REVIEW_APP_URL, {
    type: "svg",
    width: 1000,
    margin: 4,
    errorCorrectionLevel: "H",
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });
}

export default async function QRPage() {
  const qrSvg = await generateQRCode();

  return (
    <main className="qr-page">
      <section className="qr-card">
        {/* Decorative background elements */}
        <div className="qr-glow qr-glow-one" />
        <div className="qr-glow qr-glow-two" />

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
            <div
              className="qr-inner"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
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
              Choose your treatment and experience. We'll help you create a
              review in your preferred language.
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

          <p className="website">zircondentalandimplantstudio.com</p>

          <p className="location">DENTAL & IMPLANT STUDIO · PUNE</p>
        </footer>
      </section>

      {/* Screen-only actions */}
      <div className="qr-actions no-print">
        <PrintButton />

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
  );
}