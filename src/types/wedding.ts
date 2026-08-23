export type ContentStatus = "confirmed" | "pending";
export type StoryAlignment = "start" | "end";
export type GalleryAspectRatio = "portrait" | "landscape" | "square";
export type RsvpMode = "demo" | "endpoint";
export type ScheduleIcon = "church" | "celebration" | "dinner" | "music" | "rings";

export interface EditableField<T> {
  value: T | null;
  status: ContentStatus;
  placeholder: string;
}

export interface CoupleConfig { firstName: string; secondName: string; displayName: string; }
export interface WeddingDateConfig {
  isoDate: string;
  displayLong: string;
  displayShort: string;
  timeZone: string;
  ceremonyTime: EditableField<string>;
  receptionTime: EditableField<string>;
}
export interface ImageAsset { src: string; alt: string; width: number; height: number; status: ContentStatus; }
export interface PhotoTreatment {
  desktopPosition: string;
  mobilePosition: string;
  overlay?: "ivory" | "olive" | "none";
}
export interface AudioConfig { enabled: boolean; src: string; spotifyUrl: string; title: string; missingMessage: string; }
export interface MetadataConfig { title: string; description: string; canonicalUrl: EditableField<string>; openGraphImage: string; themeColor: string; }
export interface NavigationItem { label: string; href: string; }
export interface OpeningCopy {
  instructionPointer: string;
  instructionTouch: string;
  instructionKeyboard: string;
  accessibleButton: string;
  openedAnnouncement: string;
  sessionStorageKey: string;
}
export interface HeroCopy { eyebrow: string; title: string; date: string; location: string; }
export interface AnnouncementCopy {
  eyebrow: string;
  title: string;
  invitation: string;
  countdownLabels: { days: string; hours: string; minutes: string; seconds: string; };
  countdownComplete: string;
}
export interface StoryChapter {
  id: string;
  date: EditableField<string>;
  title: EditableField<string>;
  body: EditableField<string>;
  image: EditableField<string>;
  imageAlt: string;
  imageTreatment?: PhotoTreatment;
  caption: EditableField<string>;
  alignment: StoryAlignment;
}
export interface StoryConfig { eyebrow: string; title: string; introduction: EditableField<string>; chapters: StoryChapter[]; }
export interface VenueConfig {
  id: "ceremony" | "reception";
  eyebrow: string;
  name: string;
  city: EditableField<string>;
  region: EditableField<string>;
  time: EditableField<string>;
  address: EditableField<string>;
  note: EditableField<string>;
  directionsUrl: EditableField<string>;
  directionsLabel: string;
  illustration: EditableField<string>;
}
export interface ScheduleItem { id: string; time: EditableField<string>; title: string; description: EditableField<string>; icon: ScheduleIcon; }
export interface ScheduleConfig { eyebrow: string; title: string; items: ScheduleItem[]; }
export interface ColorSwatch { name: string; colorToken: string; }
export interface DressCodeGroup {
  id: "general" | "bridesmaids" | "groomsmen" | "guests";
  label: string;
  guidance: EditableField<string>;
}
export interface DressCodeConfig {
  eyebrow: string;
  title: string;
  introduction: EditableField<string>;
  groups: DressCodeGroup[];
  notes: EditableField<string>;
  swatches: ColorSwatch[];
}
export interface GalleryItem {
  id: string;
  src: EditableField<string>;
  alt: string;
  caption: EditableField<string>;
  aspectRatio: GalleryAspectRatio;
  treatment?: PhotoTreatment;
}
export interface GalleryConfig { eyebrow: string; title: string; introduction: EditableField<string>; items: GalleryItem[]; }
export interface RsvpFieldLabels {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  guestNames: string;
  guestNamesHelp: string;
  attendance: string;
  attendanceYes: string;
  attendanceNo: string;
  message: string;
  submit: string;
  submitting: string;
}
export interface RsvpMessages {
  required: string;
  invalidEmail: string;
  invalidPhone: string;
  demo: string;
  success: string;
  endpointMissing: string;
  genericError: string;
}
export interface RsvpConfig {
  eyebrow: string;
  title: string;
  introduction: string;
  modeEnvironmentVariable: "NEXT_PUBLIC_RSVP_MODE";
  defaultMode: RsvpMode;
  maxGuests: EditableField<number>;
  labels: RsvpFieldLabels;
  messages: RsvpMessages;
}
export interface GiftStore { id: string; name: string; url: EditableField<string>; }
export interface GiftPlatform { name: string; url: string; }
export interface GiftItem {
  id: string;
  title: string;
  price: string;
  image: ImageAsset;
  paymentLabel: string;
  customAmount?: boolean;
  description?: string;
  imageFit?: "cover" | "contain";
  imagePosition?: string;
}
export interface GiftsConfig {
  eyebrow: string;
  title: string;
  message: EditableField<string>;
  platform: EditableField<GiftPlatform>;
  stores: GiftStore[];
  items: GiftItem[];
  pendingMessage: string;
}
export interface TravelConfig {
  enabled: boolean;
  eyebrow: string;
  title: string;
  introduction: EditableField<string>;
  airport: EditableField<string>;
  transportation: EditableField<string>;
  hotels: EditableField<string[]>;
  beaches: EditableField<string[]>;
  recommendations: EditableField<string[]>;
  contact: EditableField<string>;
}
export interface CalendarConfig {
  allDay: boolean;
  eventTitle: string;
  description: EditableField<string>;
  location: EditableField<string>;
  googleCalendarUrl: EditableField<string>;
  downloadLabel: string;
}
export interface ClosingConfig {
  eyebrow: string;
  thankYou: string;
  names: string;
  date: string;
  calendar: CalendarConfig;
  backToTopLabel: string;
}
export interface PersonalizationConfig {
  enabled: boolean;
  allowedQueryParameters: { guestName: string; invitationCode: string; maximumCompanions: string; };
}
export interface FeatureFlags {
  showStory: boolean;
  showSchedule: boolean;
  showDressCode: boolean;
  showGallery: boolean;
  showRsvp: boolean;
  showGifts: boolean;
  showTravel: boolean;
  showAudioControl: boolean;
}
export interface WeddingContent {
  couple: CoupleConfig;
  date: WeddingDateConfig;
  metadata: MetadataConfig;
  assets: {
    monogram: ImageAsset;
    saveTheDate: ImageAsset;
    heroPhoto: ImageAsset;
    heroPhotoDesktop: ImageAsset;
    heroPhotoMobile: ImageAsset;
  };
  audio: AudioConfig;
  navigation: NavigationItem[];
  opening: OpeningCopy;
  hero: HeroCopy;
  announcement: AnnouncementCopy;
  story: StoryConfig;
  venues: VenueConfig[];
  schedule: ScheduleConfig;
  dressCode: DressCodeConfig;
  gallery: GalleryConfig;
  rsvp: RsvpConfig;
  gifts: GiftsConfig;
  travel: TravelConfig;
  closing: ClosingConfig;
  personalization: PersonalizationConfig;
  features: FeatureFlags;
}
