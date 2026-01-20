
export interface QuizAnswers {
  gender?: 'male' | 'female';
  'age'?: string; // age question id is 'age'
  zip_code?: string; // q14 id is 'zip-check' but verifies generic input? ID in constants is 'zip-check'.
  'zip-check'?: string;
  'pain-regions'?: string[];
  'primary-region'?: string;
  'pain-duration'?: string; // id: 'pain-duration'. types had 'pain_duration'
  'avg-pain'?: number; // id: 'avg-pain'. types had 'avg_pain_level'
  'worst-pain'?: number; // id: 'worst-pain'. types had 'worst_pain_level'
  'radiating-pain'?: boolean;
  'movement-triggers'?: string[];
  'prior-surgery'?: string; // id: 'prior-surgery'
  'diagnosis'?: string[]; // id: 'diagnosis'
  'treatments-tried'?: string[];
  'relief-level'?: string;
  'sleep-disruption'?: boolean;
  'mood-impact'?: string[];
  'meds-current'?: boolean;
  'upcoming-event'?: string; // It receives 'yes'/'no' string from FullButtons? Or boolean? FullButtons returns value string.
  'activity-goal'?: string;
  'time-availability'?: string;
  'biggest-concern'?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export type QuestionType =
  | 'picture-tiles'
  | 'text-input'
  | 'tile-grid'
  | 'full-buttons'
  | 'yes-no'
  | 'pain-slider'
  | 'image-buttons'
  | 'icon-buttons'
  | 'info-slide'
  | 'loading'
  | 'form'
  | 'pain-profile'
  | 'final-report'
  | 'body-map'
  | 'split-image-options'
  | 'medical-exit'
  | 'phone-capture'
  | 'gender-landing';

export interface QuestionOption {
  value: string | boolean | number;
  label: string;
  icon?: any;
  image?: string;
  subtext?: string;
  inputType?: 'text';
}

export interface QuestionConfig {
  id: string;
  section?: string;
  type: QuestionType;
  theme?: 'light' | 'dark';
  question?: string;
  subtext?: string;
  options?: QuestionOption[];
  multiSelect?: boolean;
  maxSelections?: number;
  autoAdvance?: boolean;
  validation?: (value: any) => boolean;
  next?: string | ((answers: QuizAnswers) => string);
  componentProps?: any;
}

export interface QuizState {
  currentStepId: string;
  history: string[];
  answers: QuizAnswers;
  isSoftExit: boolean;
  completed: boolean;
}
