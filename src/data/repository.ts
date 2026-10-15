import { LOCAL_STORAGE_KEYS } from '../config/constants';
import {
  User,
  WorkerProfile,
  EmployerProfile,
  Job,
  Quote,
  NegotiationThread,
  NegotiationMessage,
  Review,
  DiaryEntry,
  Report,
  Block,
  Follow,
} from './types';

// Raw seed imports for initial population only
import initialUsers from './mock/users.json';
import initialWorkerProfiles from './mock/workerProfiles.json';
import initialJobs from './mock/jobs.json';
import initialQuotes from './mock/quotes.json';
import initialNegotiations from './mock/negotiations.json';
import initialReviews from './mock/reviews.json';
import initialDiaryEntries from './mock/diaryEntries.json';
import initialReports from './mock/reports.json';
import initialBlocks from './mock/blocks.json';
import initialFollows from './mock/follows.json';

// Safe localStorage helpers
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`[Chowk Repository] Failed reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[Chowk Repository] Failed saving ${key} to localStorage:`, error);
  }
}

// Initial seed execution
export function initializeRepository(): void {
  if (!safeGet(LOCAL_STORAGE_KEYS.USERS as unknown as string, null)) {
    safeSet('chowk_users_v1', initialUsers);
  }
  if (!safeGet(LOCAL_STORAGE_KEYS.PROFILES, null)) {
    safeSet(LOCAL_STORAGE_KEYS.PROFILES, initialWorkerProfiles);
  }
  const storedJobs = safeGet<Job[] | null>(LOCAL_STORAGE_KEYS.JOBS, null);
  if (!storedJobs || storedJobs.length === 0) {
    safeSet(LOCAL_STORAGE_KEYS.JOBS, initialJobs);
  } else {
    let needsSync = false;
    const initialJobsMap = new Map((initialJobs as Job[]).map((j) => [j.id, j]));
    const syncedJobs = storedJobs.map((j) => {
      const init = initialJobsMap.get(j.id);
      if (init) {
        let changed = false;
        const updated = { ...j };
        if (init.descriptionHi !== j.descriptionHi || init.timeSlotHi !== j.timeSlotHi) {
          updated.descriptionHi = init.descriptionHi;
          updated.timeSlotHi = init.timeSlotHi;
          changed = true;
        }
        if (init.mediaType !== j.mediaType) {
          updated.mediaType = init.mediaType;
          changed = true;
        }
        if (JSON.stringify(init.images) !== JSON.stringify(j.images)) {
          updated.images = init.images;
          changed = true;
        }
        if (init.videoUrl !== j.videoUrl) {
          updated.videoUrl = init.videoUrl;
          changed = true;
        }
        if (changed) {
          needsSync = true;
          return updated;
        }
      }
      return j;
    });
    if (needsSync) {
      safeSet(LOCAL_STORAGE_KEYS.JOBS, syncedJobs);
    }
  }
  if (!safeGet(LOCAL_STORAGE_KEYS.QUOTES, null)) {
    safeSet(LOCAL_STORAGE_KEYS.QUOTES, initialQuotes);
  }
  if (!safeGet(LOCAL_STORAGE_KEYS.NEGOTIATIONS, null)) {
    safeSet(LOCAL_STORAGE_KEYS.NEGOTIATIONS, initialNegotiations);
  }
  if (!safeGet(LOCAL_STORAGE_KEYS.REVIEWS, null)) {
    safeSet(LOCAL_STORAGE_KEYS.REVIEWS, initialReviews);
  }
  if (!safeGet(LOCAL_STORAGE_KEYS.DIARY, null)) {
    safeSet(LOCAL_STORAGE_KEYS.DIARY, initialDiaryEntries);
  }
  if (!safeGet(LOCAL_STORAGE_KEYS.REPORTS, null)) {
    safeSet(LOCAL_STORAGE_KEYS.REPORTS, initialReports);
  }
  if (!safeGet(LOCAL_STORAGE_KEYS.BLOCKS, null)) {
    safeSet(LOCAL_STORAGE_KEYS.BLOCKS, initialBlocks);
  }
  if (!safeGet(LOCAL_STORAGE_KEYS.FOLLOWS, null)) {
    safeSet(LOCAL_STORAGE_KEYS.FOLLOWS, initialFollows);
  }
}

// Users
export function getUsers(): User[] {
  return safeGet<User[]>('chowk_users_v1', initialUsers as User[]);
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

export function updateUser(userId: string, updates: Partial<User>): User | undefined {
  const users = getUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    Object.assign(user, updates);
    safeSet(LOCAL_STORAGE_KEYS.USERS, users);
  }
  return user;
}

// Worker Profiles
export function getWorkerProfiles(): WorkerProfile[] {
  return safeGet<WorkerProfile[]>(LOCAL_STORAGE_KEYS.PROFILES, initialWorkerProfiles as WorkerProfile[]);
}

export function getWorkerProfile(userId: string): WorkerProfile | undefined {
  return getWorkerProfiles().find((p) => p.userId === userId);
}

export function updateWorkerProfile(userId: string, updates: Partial<WorkerProfile>): WorkerProfile {
  const profiles = getWorkerProfiles();
  const index = profiles.findIndex((p) => p.userId === userId);
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...updates };
    safeSet(LOCAL_STORAGE_KEYS.PROFILES, profiles);
    return profiles[index];
  }
  const newProfile: WorkerProfile = {
    userId,
    trade: 'plumber',
    experienceYears: 1,
    introVideoUrl: '',
    rating: 5.0,
    jobsCompleted: 0,
    radiusKm: 10,
    availableToday: true,
    portfolioReels: [],
    ...updates,
  };
  profiles.push(newProfile);
  safeSet(LOCAL_STORAGE_KEYS.PROFILES, profiles);
  return newProfile;
}

// Jobs
export function getJobs(): Job[] {
  return safeGet<Job[]>(LOCAL_STORAGE_KEYS.JOBS, initialJobs as Job[]);
}

export function getJobById(jobId: string): Job | undefined {
  return getJobs().find((j) => j.id === jobId);
}

export function postJob(jobData: Omit<Job, 'id' | 'createdAt' | 'status'>): Job {
  const jobs = getJobs();
  const newJob: Job = {
    ...jobData,
    id: `job_${Date.now()}`,
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  jobs.unshift(newJob);
  safeSet(LOCAL_STORAGE_KEYS.JOBS, jobs);
  return newJob;
}

export function updateJobStatus(jobId: string, status: Job['status']): Job | undefined {
  const jobs = getJobs();
  const index = jobs.findIndex((j) => j.id === jobId);
  if (index === -1) return undefined;
  jobs[index].status = status;
  safeSet(LOCAL_STORAGE_KEYS.JOBS, jobs);
  return jobs[index];
}

export function getJobsForWorkerFeed(workerId: string): Job[] {
  const profile = getWorkerProfile(workerId);
  const jobs = getJobs();
  const submittedQuotes = getQuotesForWorker(workerId);
  const quotedJobIds = new Set(submittedQuotes.map((q) => q.jobId));

  return jobs.filter((job) => {
    // Worker only browses open jobs they haven't quoted on yet in their feed
    if (job.status !== 'open') return false;
    if (quotedJobIds.has(job.id)) return false;
    // A block in either direction hides the job — same as if it didn't exist
    if (isBlocked(workerId, job.employerId)) return false;
    // Filter by trade if worker has a trade
    if (profile && profile.trade && job.trade !== profile.trade) {
      return false;
    }
    // Filter by radius if location info is present
    if (profile && job.location.distanceKmFromViewer !== undefined) {
      if (job.location.distanceKmFromViewer > profile.radiusKm) {
        return false;
      }
    }
    return true;
  });
}

export function getJobsForEmployer(employerId: string): Job[] {
  return getJobs().filter((j) => j.employerId === employerId);
}

// Quotes
export function getQuotes(): Quote[] {
  return safeGet<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, initialQuotes as Quote[]);
}

export function getQuotesForJob(jobId: string): Quote[] {
  return getQuotes().filter((q) => q.jobId === jobId);
}

export function getQuotesForWorker(workerId: string): Quote[] {
  return getQuotes().filter((q) => q.workerId === workerId);
}

export function submitQuote(quoteData: {
  jobId: string;
  workerId: string;
  quotedPrice: number;
  voiceNoteUrl?: string;
}): Quote {
  const quotes = getQuotes();
  // Check if already quoted
  const existingIndex = quotes.findIndex(
    (q) => q.jobId === quoteData.jobId && q.workerId === quoteData.workerId
  );
  if (existingIndex !== -1) {
    quotes[existingIndex] = {
      ...quotes[existingIndex],
      quotedPrice: quoteData.quotedPrice,
      voiceNoteUrl: quoteData.voiceNoteUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    safeSet(LOCAL_STORAGE_KEYS.QUOTES, quotes);
    return quotes[existingIndex];
  }

  const newQuote: Quote = {
    id: `quote_${Date.now()}`,
    jobId: quoteData.jobId,
    workerId: quoteData.workerId,
    quotedPrice: quoteData.quotedPrice,
    voiceNoteUrl: quoteData.voiceNoteUrl,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  quotes.unshift(newQuote);
  safeSet(LOCAL_STORAGE_KEYS.QUOTES, quotes);
  return newQuote;
}

export function updateQuoteStatus(quoteId: string, status: Quote['status']): Quote | undefined {
  const quotes = getQuotes();
  const index = quotes.findIndex((q) => q.id === quoteId);
  if (index === -1) return undefined;
  quotes[index].status = status;
  safeSet(LOCAL_STORAGE_KEYS.QUOTES, quotes);
  return quotes[index];
}

// Negotiations
export function getNegotiationThreads(): NegotiationThread[] {
  return safeGet<NegotiationThread[]>(LOCAL_STORAGE_KEYS.NEGOTIATIONS, initialNegotiations as NegotiationThread[]);
}

export function getNegotiationThreadById(id: string): NegotiationThread | undefined {
  return getNegotiationThreads().find((t) => t.id === id);
}

export function getNegotiationThreadByJobAndWorker(
  jobId: string,
  workerId: string
): NegotiationThread | undefined {
  return getNegotiationThreads().find((t) => t.jobId === jobId && t.workerId === workerId);
}

export function openOrGetNegotiationThread(
  jobId: string,
  workerId: string,
  employerId: string,
  initialOfferAmount: number
): NegotiationThread {
  const threads = getNegotiationThreads();
  const existing = threads.find((t) => t.jobId === jobId && t.workerId === workerId);
  if (existing) return existing;

  const newThread: NegotiationThread = {
    id: `thread_${Date.now()}`,
    jobId,
    workerId,
    employerId,
    currentOfferAmount: initialOfferAmount,
    messages: [
      {
        id: `msg_${Date.now()}`,
        threadId: `thread_${Date.now()}`,
        sender: 'worker',
        type: 'offer',
        offerAmount: initialOfferAmount,
        text: `Initial quote sent for ₹${initialOfferAmount}`,
        createdAt: new Date().toISOString(),
      },
    ],
    locked: false,
  };
  threads.unshift(newThread);
  safeSet(LOCAL_STORAGE_KEYS.NEGOTIATIONS, threads);

  // Update quote status to negotiating if it was pending
  const quotes = getQuotes();
  const quote = quotes.find((q) => q.jobId === jobId && q.workerId === workerId);
  if (quote && quote.status === 'pending') {
    quote.status = 'negotiating';
    safeSet(LOCAL_STORAGE_KEYS.QUOTES, quotes);
  }

  return newThread;
}

export function postNegotiationMessage(
  threadId: string,
  message: {
    sender: 'worker' | 'employer';
    type: 'text' | 'voice' | 'offer';
    text?: string;
    voiceUrl?: string;
    offerAmount?: number;
  }
): NegotiationThread | undefined {
  const threads = getNegotiationThreads();
  const index = threads.findIndex((t) => t.id === threadId);
  if (index === -1) return undefined;

  const newMessage: NegotiationMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    threadId,
    sender: message.sender,
    type: message.type,
    text: message.text,
    voiceUrl: message.voiceUrl,
    offerAmount: message.offerAmount,
    createdAt: new Date().toISOString(),
  };

  threads[index].messages.push(newMessage);
  if (message.offerAmount) {
    threads[index].currentOfferAmount = message.offerAmount;
  }

  safeSet(LOCAL_STORAGE_KEYS.NEGOTIATIONS, threads);
  return threads[index];
}

/**
 * When one thread locks:
 * 1. Thread locked: true + lockedTerms
 * 2. Job flips to status: 'filled'
 * 3. Chosen worker's quote flips to 'accepted'
 * 4. All other open quotes on that job flip to 'declined'
 * 5. Creates diary entry for the worker
 */
export function lockNegotiationTerms(
  threadId: string,
  terms: { price: number; time: string; paymentMethod: string }
): NegotiationThread | undefined {
  const threads = getNegotiationThreads();
  const threadIndex = threads.findIndex((t) => t.id === threadId);
  if (threadIndex === -1) return undefined;

  const thread = threads[threadIndex];
  thread.locked = true;
  thread.lockedTerms = terms;
  thread.currentOfferAmount = terms.price;
  safeSet(LOCAL_STORAGE_KEYS.NEGOTIATIONS, threads);

  // Update Job to filled
  updateJobStatus(thread.jobId, 'filled');

  // Update quotes
  const quotes = getQuotes();
  quotes.forEach((q) => {
    if (q.jobId === thread.jobId) {
      if (q.workerId === thread.workerId) {
        q.status = 'accepted';
      } else if (q.status === 'pending' || q.status === 'negotiating') {
        q.status = 'declined';
      }
    }
  });
  safeSet(LOCAL_STORAGE_KEYS.QUOTES, quotes);

  // Pre-seed a pending diary entry for the worker
  const job = getJobById(thread.jobId);
  const diaryEntries = getDiaryEntries(thread.workerId);
  const existingDiary = diaryEntries.find((d) => d.jobId === thread.jobId);
  if (!existingDiary) {
    const newDiary: DiaryEntry = {
      id: `diary_${Date.now()}`,
      workerId: thread.workerId,
      jobId: thread.jobId,
      jobTitle: job ? job.description.slice(0, 40) + '...' : 'Confirmed job',
      amount: terms.price,
      paid: false,
      paymentMethod: terms.paymentMethod as 'upi' | 'cash',
      date: new Date().toISOString().split('T')[0],
    };
    const allDiary = safeGet<DiaryEntry[]>(LOCAL_STORAGE_KEYS.DIARY, initialDiaryEntries as DiaryEntry[]);
    allDiary.unshift(newDiary);
    safeSet(LOCAL_STORAGE_KEYS.DIARY, allDiary);
  }

  return thread;
}

// Reviews
export function getReviewsForUser(userId: string): Review[] {
  const reviews = safeGet<Review[]>(LOCAL_STORAGE_KEYS.REVIEWS, initialReviews as Review[]);
  return reviews.filter((r) => r.toUserId === userId);
}

export function submitReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
  const reviews = safeGet<Review[]>(LOCAL_STORAGE_KEYS.REVIEWS, initialReviews as Review[]);
  const newReview: Review = {
    ...reviewData,
    id: `rev_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  reviews.unshift(newReview);
  safeSet(LOCAL_STORAGE_KEYS.REVIEWS, reviews);
  return newReview;
}

// Diary
export function getDiaryEntries(workerId: string): DiaryEntry[] {
  const diary = safeGet<DiaryEntry[]>(LOCAL_STORAGE_KEYS.DIARY, initialDiaryEntries as DiaryEntry[]);
  return diary.filter((d) => d.workerId === workerId);
}

export function updateDiaryEntryPayment(id: string, paid: boolean): DiaryEntry | undefined {
  const diary = safeGet<DiaryEntry[]>(LOCAL_STORAGE_KEYS.DIARY, initialDiaryEntries as DiaryEntry[]);
  const entry = diary.find((d) => d.id === id);
  if (entry) {
    entry.paid = paid;
    safeSet(LOCAL_STORAGE_KEYS.DIARY, diary);
  }
  return entry;
}

// Reports — stored for a future moderation/support queue; nothing in this
// mock frontend acts on them automatically beyond the reporter's own confirmation.
export function getReports(): Report[] {
  return safeGet<Report[]>(LOCAL_STORAGE_KEYS.REPORTS, initialReports as Report[]);
}

export function submitReport(reportData: Omit<Report, 'id' | 'createdAt'>): Report {
  const reports = getReports();
  const newReport: Report = {
    ...reportData,
    id: `report_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  reports.unshift(newReport);
  safeSet(LOCAL_STORAGE_KEYS.REPORTS, reports);
  return newReport;
}

// Blocks — mutual: either side blocking the other hides both directions,
// matching real expectations ("I blocked them" should also mean "they can't
// reach me").
export function getBlocks(): Block[] {
  return safeGet<Block[]>(LOCAL_STORAGE_KEYS.BLOCKS, initialBlocks as Block[]);
}

export function blockUser(blockerId: string, blockedUserId: string): Block {
  const blocks = getBlocks();
  const existing = blocks.find(
    (b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId
  );
  if (existing) return existing;
  const newBlock: Block = {
    id: `block_${Date.now()}`,
    blockerId,
    blockedUserId,
    createdAt: new Date().toISOString(),
  };
  blocks.unshift(newBlock);
  safeSet(LOCAL_STORAGE_KEYS.BLOCKS, blocks);
  return newBlock;
}

export function unblockUser(blockerId: string, blockedUserId: string): void {
  const blocks = getBlocks().filter(
    (b) => !(b.blockerId === blockerId && b.blockedUserId === blockedUserId)
  );
  safeSet(LOCAL_STORAGE_KEYS.BLOCKS, blocks);
}

export function isBlocked(userIdA: string, userIdB: string): boolean {
  const blocks = getBlocks();
  return blocks.some(
    (b) =>
      (b.blockerId === userIdA && b.blockedUserId === userIdB) ||
      (b.blockerId === userIdB && b.blockedUserId === userIdA)
  );
}

export function hasBlocked(blockerId: string, blockedUserId: string): boolean {
  return getBlocks().some((b) => b.blockerId === blockerId && b.blockedUserId === blockedUserId);
}

// Follows — one-directional, employer (or anyone) following a worker's profile.
export function getFollows(): Follow[] {
  return safeGet<Follow[]>(LOCAL_STORAGE_KEYS.FOLLOWS, initialFollows as Follow[]);
}

export function isFollowing(followerId: string, followingId: string): boolean {
  return getFollows().some((f) => f.followerId === followerId && f.followingId === followingId);
}

export function getFollowerCount(followingId: string): number {
  return getFollows().filter((f) => f.followingId === followingId).length;
}

export function followWorker(followerId: string, followingId: string): Follow | undefined {
  if (followerId === followingId) return undefined;
  const follows = getFollows();
  const existing = follows.find((f) => f.followerId === followerId && f.followingId === followingId);
  if (existing) return existing;
  const newFollow: Follow = {
    id: `follow_${Date.now()}`,
    followerId,
    followingId,
    createdAt: new Date().toISOString(),
  };
  follows.unshift(newFollow);
  safeSet(LOCAL_STORAGE_KEYS.FOLLOWS, follows);
  return newFollow;
}

export function unfollowWorker(followerId: string, followingId: string): void {
  const follows = getFollows().filter(
    (f) => !(f.followerId === followerId && f.followingId === followingId)
  );
  safeSet(LOCAL_STORAGE_KEYS.FOLLOWS, follows);
}
