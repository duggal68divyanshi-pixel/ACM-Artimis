/**
 * Central configuration file for Chowk (चौक).
 * Per spec §0: APP_NAME is defined here in exactly one place.
 */
export const APP_NAME = "Chowk";
export const APP_NAME_DEVANAGARI = "चौक";

export const LOCAL_STORAGE_KEYS = {
  USERS: 'chowk_users_v1',
  LANG: 'chowk_lang_v1',
  SESSION: 'chowk_session_v1',
  JOBS: 'chowk_jobs_v1',
  QUOTES: 'chowk_quotes_v1',
  NEGOTIATIONS: 'chowk_negotiations_v1',
  PROFILES: 'chowk_profiles_v1',
  REVIEWS: 'chowk_reviews_v1',
  DIARY: 'chowk_diary_v1',
  REPORTS: 'chowk_reports_v1',
  BLOCKS: 'chowk_blocks_v1',
  FOLLOWS: 'chowk_follows_v1',
} as const;

export const AVAILABLE_TRADES = [
  { id: 'plumber', icon: 'Wrench', labelEn: 'Plumber', labelHi: 'प्लम्बर' },
  { id: 'electrician', icon: 'Zap', labelEn: 'Electrician', labelHi: 'इलेक्ट्रीशियन' },
  { id: 'carpenter', icon: 'Hammer', labelEn: 'Carpenter', labelHi: 'बढ़ई' },
  { id: 'painter', icon: 'Paintbrush', labelEn: 'Painter', labelHi: 'पेंटर' },
  { id: 'mason', icon: 'BrickWall', labelEn: 'Mason', labelHi: 'राजमिस्त्री' },
  { id: 'labourer', icon: 'HardHat', labelEn: 'Labourer', labelHi: 'मजदूर' },
] as const;

export const RADIUS_OPTIONS = [2, 5, 10, 15, 25] as const;

export const URGENCY_OPTIONS = [
  { id: 'today', labelEn: 'Today', labelHi: 'आज' },
  { id: 'tomorrow', labelEn: 'Tomorrow', labelHi: 'कल' },
  { id: 'scheduled', labelEn: 'Pick a date', labelHi: 'तारीख चुनें' },
] as const;

export const TIME_SLOT_OPTIONS = [
  { id: 'morning', labelEn: 'Morning (8 AM - 12 PM)', labelHi: 'सुबह (8 बजे - 12 बजे)' },
  { id: 'afternoon', labelEn: 'Afternoon (12 PM - 4 PM)', labelHi: 'दोपहर (12 बजे - 4 बजे)' },
  { id: 'evening', labelEn: 'Evening (4 PM - 8 PM)', labelHi: 'शाम (4 बजे - 8 बजे)' },
  { id: 'urgent', labelEn: 'Within 2 hours', labelHi: '2 घंटे के अंदर' },
] as const;

export const PAYMENT_TIMING_OPTIONS = [
  { id: 'same_day', labelEn: 'Same day cash/UPI', labelHi: 'उसी दिन नकद/UPI' },
  { id: 'on_completion', labelEn: 'On completion', labelHi: 'काम पूरा होने पर' },
  { id: 'daily', labelEn: 'Daily payment', labelHi: 'दैनिक भुगतान' },
] as const;

export const SKIP_REASONS = [
  { id: 'too_far', icon: 'MapPinOff', labelEn: 'Too far', labelHi: 'बहुत दूर है' },
  { id: 'pay_too_low', icon: 'TrendingDown', labelEn: 'Pay too low', labelHi: 'रुपये कम हैं' },
  { id: 'wrong_timing', icon: 'Clock', labelEn: 'Wrong timing', labelHi: 'समय नहीं जमा' },
] as const;

// One-tap reasons for the Report action — never free-text-only, per the
// icon+word accessibility rule. 'other' pairs with an optional note field.
export const REPORT_REASONS = [
  { id: 'fake_misleading', icon: 'EyeOff', labelEn: 'Fake or misleading', labelHi: 'झूठा या गुमराह करने वाला' },
  { id: 'inappropriate', icon: 'ShieldAlert', labelEn: 'Inappropriate content', labelHi: 'अनुचित सामग्री' },
  { id: 'advance_payment', icon: 'Banknote', labelEn: 'Asking for advance payment', labelHi: 'पहले पैसे मांग रहे हैं' },
  { id: 'other', icon: 'MoreHorizontal', labelEn: 'Something else', labelHi: 'कुछ और' },
] as const;

// Short, non-judgmental reminders shown right before recording, so a post is
// more likely to actually show the work — guidance only, no auto-detection.
export const CONTENT_GUIDELINES = [
  { id: 'show_work', icon: 'Camera', labelEn: 'Show the real work area', labelHi: 'असली काम की जगह दिखाएं' },
  { id: 'no_music', icon: 'Music2', labelEn: 'No music or lip-sync', labelHi: 'गाना या लिप-सिंक न डालें' },
  { id: 'keep_short', icon: 'Timer', labelEn: 'Keep it under a minute', labelHi: 'एक मिनट से कम रखें' },
] as const;
