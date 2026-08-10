"use client";

/**
 * Shareable "done for you" moment after an application kit is ready.
 */

import { useCallback, useState } from "react";
import { Check, Copy, FileText } from "@/components/brand/icons";
import { Button, Modal, ModalFooter, useToast } from "@/components/ui";

export type KitDoneMomentProps = {
  open: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName?: string | null;
  onPreview: () => void;
  portfolioUrl?: string | null;
};

export function KitDoneMoment({
  open,
  onClose,
  jobTitle,
  companyName,
  onPreview,
  portfolioUrl,
}: KitDoneMomentProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = [
    `Hireschema just built my application kit for ${jobTitle}${companyName ? ` at ${companyName}` : ""}.`,
    "Tailored resume + cover letter + interview prep — done for me.",
    portfolioUrl ? `Profile: ${portfolioUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Copied — paste anywhere");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy");
    }
  }, [shareText, toast]);

  return (
    <Modal open={open} onClose={onClose} title="Application kit ready" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-ink-100 bg-ink-50/40 px-4 py-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-900 text-paper-1">
            <Check className="h-4 w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-small font-medium text-ink-900">
              Done for you — {jobTitle}
              {companyName ? ` at ${companyName}` : ""}
            </p>
            <ul className="mt-2 space-y-1 text-micro text-ink-600">
              <li>Tailored resume</li>
              <li>Cover letter</li>
              <li>Interview prep</li>
            </ul>
          </div>
        </div>
        <p className="text-small text-ink-500">
          Preview the kit, or copy a short note to share that Hireschema did the heavy lifting.
        </p>
      </div>
      <ModalFooter>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void handleCopy()}
          leftIcon={
            copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
            )
          }
        >
          {copied ? "Copied" : "Copy share text"}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            onPreview();
            onClose();
          }}
          leftIcon={<FileText className="h-3.5 w-3.5" strokeWidth={1.5} />}
        >
          Preview kit
        </Button>
      </ModalFooter>
    </Modal>
  );
}
