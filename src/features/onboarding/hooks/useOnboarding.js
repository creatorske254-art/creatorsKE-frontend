import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { onboardingService } from '../services/onboarding.service';

export function useOnboarding() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({});
  const [isResuming, setIsResuming] = useState(true);
  const saveTimer = useRef(null);

  // Hydrate from any previously saved draft on mount.
  useEffect(() => {
    onboardingService
      .resume()
      .then((data) => {
        if (data?.draft) setDraft(data.draft);
        if (typeof data?.step === 'number') setStep(data.step);
      })
      .catch(() => {
        // No draft yet, or resume failed - start fresh.
      })
      .finally(() => setIsResuming(false));
  }, []);

  // Debounced auto-save (1s) whenever the draft changes.
  const updateDraft = useCallback((fields) => {
    setDraft((prev) => {
      const next = { ...prev, ...fields };
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        onboardingService.saveDraft(next).catch(() => {});
      }, 1000);
      return next;
    });
  }, []);

  const completeMutation = useMutation({
    mutationFn: () => onboardingService.complete(draft),
  });

  return {
    step,
    setStep,
    draft,
    updateDraft,
    isResuming,
    complete: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
  };
}
