export enum CommonQueryKeys {
  Winners = 'winners',
  ActiveRaffles = 'active-raffles',
  RafflesCountdowns = 'raffles-countdowns',
  BonusDraw = 'bonus-draw',
  ActiveBonusDraws = 'active-bonus-draws',
  Charities = 'charities',
  HomeContent = 'home-content',
}


export interface WinnerBase {
  _id: string;
  name: string;
  description: string;
  drawDate: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  videoUrl?: string;
  __v: number;
}

export interface WinnersResponse {
  winners: WinnerBase[];
  allCount: number;
  years: number[];
}

export interface ActiveRafflesResponse {
  activeRaffles: ActiveRafflesModel[];
  activeRafflesCount: number;
}

export interface ActiveRafflesModel {
  _id: string;
  stepperCountdown: StepperCountdownModel;
  endsAt: string;
  property: ActiveRafflesPropertyModel;
  title: string;
  bundleTitle: string;
}

export interface StepperCountdownModel {
  isActive: boolean;
  title: string;
  startAt: string;
  endsAt: string;
}

export interface ActiveRafflesPropertyModel {
  _id: string;
  galleryImages: string[];
  galleryImagesMobile: string[];
  floorPlanImage: string;
  locationMapImage: string;
  cardImage: string;
  mobileCardImage: string;
}

export type CompetitionType = 'DREAMHOME' | 'FIXED_ODDS' | 'PRIZE';

export interface CompetitionCountdownDreamHomeModel {
  _id: string;
  startAt: string;
  endsAt: string;
  dreamHome: {
    stepperCountdown: StepperCountdownModel;
    active: boolean;
    defaultTickets: number;
    isActiveDiscount: boolean;
    isDiscountRates: boolean;
    isClosed: boolean;
    isPopular: boolean;
    isTrending: boolean;
    isRemoved: boolean;
    creditsRates: {
      id: string;
      count: number;
      percent: number;
    }[];
    isCreditsActive: boolean;
    discountRates: {
      amountTickets: number;
      percent: number;
      newPrice: number;
    }[];
    freeTicketsRates: any[];
    isFreeTicketsRates: boolean;
    ticketsBundles: number[];
    _id: string;
    endsAt: string;
    startAt: string;
    ticketPrice: number;
    property: string;
    creditsEndDate: string;
    creditsStartDate: string;
    isCreditsPermanent: boolean;
    discountTicket: {
      percent: number;
      newPrice: number;
    };
    discountCategory: string;
    title: string;
    bundleTitle: string;
    metaTitle: string;
    metaDescription: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    content: string;
  };
  stepperCountdown: StepperCountdownModel;
  isHasDiscount: boolean;
  competitionType: 'DREAMHOME';
  ordersCount: number;
}

export interface CompetitionCountdownFixedOddsModel {
  ticketsBought?: number;
  _id: string;
  maxTickets: number;
  endsAt: string;
  isHasDiscount: boolean;
  competitionType: 'FIXED_ODDS';
  ordersCount: number;
}

export interface CompetitionCountdownPrizeModel {
  _id: string;
  startAt: string;
  endsAt: string;
  isHasDiscount: boolean;
  ordersCount: number;
  competitionType: 'PRIZE';
}

export type RafflesCountdownsResponse =
  | CompetitionCountdownDreamHomeModel
  | CompetitionCountdownFixedOddsModel
  | CompetitionCountdownPrizeModel;

export interface BonusDrawResponse {
  _id: string;
  isActive: boolean;
  raffles: { title: string; _id: string }[];
  pageTitle: string;
  profileTitle: string;
  metaTitle: string;
  metaDescription: string;
  price: string;
  color: string;
  startAt: string;
  endAt: string;
  __v: number;
}

export interface CharityItemModel {
  isActiveOnCheckoutPage: boolean;
  isActiveOnCharityPage: boolean;
  landingTag: string;
  name: string;
  description: string;
  image: string;
  thumbnailImage: string;
  landingUrl: string;
  charityUrl: string;
  value: string;
  order: number;
  createdAt: string;
  _id: string;
  updatedAt: string;
}

export interface CharitiesResponse {
  checkoutCharities: CharityItemModel[];
}

export interface VideoContentModel {
  title: string;
  videoMobileUrl: string;
  videoDesktopUrl: string;
  videoPreviewMobileUrl: string;
  badgePrice: string;
  videoPreviewUrl: string;
}

export interface IconModel {
  _id: string;
  iconUrl: string;
  iconTitle: string;
  iconDescription?: string;
}

export interface DreamHomeContentModel {
  description: string[];
  imageText: string[];
  title: string;
  subtitle: string;
  icons: IconModel[];
  imageUrl: string;
  imageX2Url: string;
  imageMobileUrl: string;
  imageMobileX2Url: string;
}

export interface TimelineStepperModel {
  description: string[];
  _id: string;
  iconUrl: string;
  title: string;
}

export interface TimelineModel {
  title: string;
  description: string;
  specialBadge: string;
  stepper: TimelineStepperModel[];
  footerText: string;
}

export interface AccordionItemModel {
  isSpecial: boolean;
  _id: string;
  iconUrl: string;
  title: string;
  description: string;
}

export interface GalleryItemModel {
  _id: string;
  title: string;
  description: string;
  image800Url: string;
  image1600Url: string;
  image2048Url: string;
  image3840Url: string;
}

export interface InfoDescriptionItemModel {
  _id: string;
  text: string;
  iconUrl?: string;
  subtitle?: string;
}

export interface InfoItemModel {
  _id: string;
  title: string;
  description: InfoDescriptionItemModel[];
}

export interface DreamHomeModel {
  video: VideoContentModel;
  content: DreamHomeContentModel;
  timeLine: TimelineModel;
  floorPlanUrl: string;
  floorPlanMobileUrl: string;
  accordionData: AccordionItemModel[];
  gallery: GalleryItemModel[];
  info: InfoItemModel[];
}

export interface BonusDrawContentModel {
  description: string[];
  icons: IconModel[];
  imageUrl: string;
  imageMobileUrl: string;
  imageMobileX2Url: string;
  imageX2Url: string;
  title: string;
}

export interface BonusDrawModel {
  video: VideoContentModel;
  mainImage: GalleryItemModel;
  content: BonusDrawContentModel;
  title: string;
  badgePrice: string;
  gallery: GalleryItemModel[];
}

export interface HomeContentResponse {
  dreamHome: DreamHomeModel;
  bonusDraw: BonusDrawModel;
  _id: string;
}
