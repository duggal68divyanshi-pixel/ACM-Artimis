export type Language = 'en' | 'hi';
export type UserRole = 'worker' | 'employer';

export interface User {
  id: string;
  name: string;
  phone: string;
  roles: UserRole[];
  language: Language;
  verified: boolean; // Aadhaar-style mock verification flag
  avatarUrl?: string;
  locationLabel?: string;
}

export interface WorkerProfile {
  userId: string;
  trade: string;            // 'plumber' | 'electrician' | 'carpenter' | 'painter' | 'mason' | 'labourer'
  experienceYears: number;
  introVideoUrl: string;    // local placeholder asset / poster
  rating: number;           // 0-5
  jobsCompleted: number;
  radiusKm: number;         // worker-set, from onboarding / editable in profile
  availableToday: boolean;
  // Women's safety — both optional, self-disclosed, editable any time from the
  // profile. isWoman unlocks safetyMode; safetyMode unlocks the emergency
  // contact + live-location-share affordance during a job.
  isWoman?: boolean;
  safetyMode?: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  portfolioReels: {
    id: string;
    videoUrl: string;
    thumbUrl: string;
    caption: string;
    /** Groups the grid into labeled sections on the profile, e.g. "Repairs",
     *  "Installations" — defaults to a single general section when absent. */
    category?: string;
  }[];
}

export interface Follow {
  id: string;
  followerId: string; // usually an employer
  followingId: string; // the worker being followed
  createdAt: string;
}

export interface EmployerProfile {
  userId: string;
  companyOrName: string;
  address: string;
  verifiedGstOrId: boolean;
  rating: number;
  jobsPostedCount: number;
}

export interface Job {
  id: string;
  employerId: string;
  trade: string;
  /** 'video' = a short clip of the work (rendered as the reel background).
   *  'carousel' = a swipeable set of photos of the work instead of a video. */
  mediaType: 'video' | 'carousel';
  videoUrl?: string;        // used when mediaType === 'video'
  images?: string[];        // used when mediaType === 'carousel' — short photo captions/seeds, 1-6
  description: string;
  suggestedPrice: number;   // anchor only, not binding
  location: {
    label: string;
    lat: number;
    lng: number;
    distanceKmFromViewer?: number;
  };
  urgency: 'today' | 'tomorrow' | 'scheduled';
  scheduledFor?: string;    // ISO date or slot if urgency === 'scheduled'
  timeSlot?: string;        // e.g. 'Morning (8 AM - 12 PM)'
  paymentTiming: 'same_day' | 'on_completion' | 'daily';
  /** Employer-set preference, shown as a badge and filterable in the feed —
   *  never used to hide the job from anyone, just to surface the preference. */
  preferWomanWorker?: boolean;
  status: 'open' | 'filled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Quote {
  id: string;
  jobId: string;
  workerId: string;
  quotedPrice: number;
  voiceNoteUrl?: string;
  status: 'pending' | 'negotiating' | 'accepted' | 'declined';
  createdAt: string;
}

export interface NegotiationMessage {
  id: string;
  threadId: string;
  sender: 'worker' | 'employer';
  type: 'text' | 'voice' | 'offer';
  text?: string;
  voiceUrl?: string;
  offerAmount?: number;
  createdAt: string;
}

export interface NegotiationThread {
  id: string;
  jobId: string;
  workerId: string;
  employerId: string;
  currentOfferAmount: number;
  messages: NegotiationMessage[];
  locked: boolean;          // true once both sides confirm — this is the trust mechanism
  lockedTerms?: {
    price: number;
    time: string;
    paymentMethod: string;
  };
}

export interface Review {
  id: string;
  jobId: string;
  fromUserId: string;
  toUserId: string;
  rating: 1 | 2 | 3;        // 3-level simple scale: 1: Bad, 2: Ok, 3: Great
  mediaUrl?: string;
  note?: string;
  paidOnTime?: boolean;     // Worker prompt specific
  createdAt?: string;
}

export interface DiaryEntry {
  id: string;
  workerId: string;
  jobId: string;
  jobTitle?: string;
  amount: number;
  paid: boolean;
  paymentMethod: 'upi' | 'cash';
  date: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetUserId: string;
  /** Where the report was filed from — lets Rights/support triage it later. */
  context: 'job' | 'worker_profile' | 'negotiation';
  contextId?: string; // jobId, workerId, or threadId depending on `context`
  reason: string; // a REPORT_REASONS id
  note?: string;
  createdAt: string;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}
