"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * "Invite a friend" — shows a QR code for the app URL so a second player
 * can open the game on their own phone. Single-player for now: each
 * player gets their own card. (Real shared games arrive with
 * multiplayer, Milestone 8.)
 */
export function InviteButton() {
  const [qr, setQr] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!qr) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setQr(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [qr]);

  async function open() {
    const target = window.location.origin;
    setUrl(target);
    setCopied(false);
    try {
      const dataUrl = await QRCode.toDataURL(target, {
        width: 640,
        margin: 1,
        color: { dark: "#2b211a", light: "#ffffff" },
      });
      setQr(dataUrl);
    } catch (e) {
      console.error("QR generation failed", e);
      setQr(null);
    }
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Dog Bingo",
          text: "Play Dog Bingo with me!",
          url,
        });
        return;
      }
    } catch {
      /* user cancelled share sheet */
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        data-testid="invite"
        className="bg-surface mt-3 flex min-h-[var(--touch-min)] w-full items-center justify-center gap-2 rounded-full py-3 text-lg font-black shadow-[var(--shadow-tile)] active:scale-95"
      >
        <span aria-hidden>📱</span> Invite a friend
      </button>

      {qr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setQr(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
            data-testid="invite-dialog"
            onClick={(e) => e.stopPropagation()}
            className="bg-surface anim-rise w-full max-w-sm rounded-[var(--radius-card)] p-6 text-center shadow-[var(--shadow-pop)]"
          >
            <h2 id="invite-title" className="text-2xl font-black">
              Invite a friend
            </h2>
            <p className="text-muted pt-1 text-sm">
              Scan to open the game on another phone. You each play your own
              card — first to finish wins!
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr}
              alt={`QR code linking to ${url}`}
              className="mx-auto mt-4 w-full max-w-[280px] rounded-2xl border-4 border-[var(--border)]"
            />
            <p className="text-muted pt-2 text-xs break-all">{url}</p>
            <div className="flex flex-col gap-2 pt-4">
              <button
                type="button"
                onClick={share}
                className="bg-accent min-h-[var(--touch-min)] rounded-full py-3 text-lg font-black text-white active:scale-95"
              >
                {copied ? "Link copied!" : "Share link"}
              </button>
              <button
                type="button"
                onClick={() => setQr(null)}
                aria-label="Close"
                className="text-muted min-h-[var(--touch-min)] py-2 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
