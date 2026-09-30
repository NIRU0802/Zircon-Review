"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      className="print-button"
      onClick={() => window.print()}
    >
      <span className="print-icon">⎙</span>
      Print QR Card
    </button>
  );
}