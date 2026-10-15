import { Job, Language } from '../data/types';

/**
 * Picks the Hindi variant of a job's free-text fields when one was seeded and
 * the viewer is in Hindi, else falls back to the original text. This only
 * covers the pre-seeded demo jobs — a freshly posted job's own description
 * stays in whatever language the employer actually typed it in, same as any
 * real app without a live translation service.
 */
export function getJobDescription(job: Pick<Job, 'description' | 'descriptionHi'>, language: Language): string {
  if (language === 'hi' && job.descriptionHi) return job.descriptionHi;
  return job.description;
}

export function getJobTimeSlot(
  job: Pick<Job, 'timeSlot' | 'timeSlotHi'>,
  language: Language
): string | undefined {
  if (language === 'hi' && job.timeSlotHi) return job.timeSlotHi;
  return job.timeSlot;
}
