export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  bio: string;
  isArtist: boolean;
  isPro: boolean;
  isPremium: boolean;
  followers: number;
  following: number;
  verified: boolean;
  role: 'fan' | 'artist' | 'business_introducer' | 'regional_manager';
  activationCodes: string[];
  subscriptionStatus: 'active' | 'inactive' | 'cancelled';
  subscriptionPlan: 'free' | 'premium' | 'pro';
  stripeCustomerId?: string;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  uri: string;
  thumbnail: string;
  title: string;
  description: string;
  user: User;
  event?: Event;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  createdAt: string;
  duration: number;
  views: number;
}

export interface Event {
  id: string;
  title: string;
  artist: string;
  venue: string;
  date: string;
  time: string;
  image: string;
  price: number;
  ticketsAvailable: boolean;
  location: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  category: 'concert' | 'festival' | 'club' | 'tour';
  isLive?: boolean;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
  likes: number;
}

export interface Ticket {
  id: string;
  event: Event;
  type: 'general' | 'vip' | 'backstage';
  price: number;
  quantity: number;
}

export type Theme = 'light' | 'dark';

export interface Subscription {
  id: string;
  userId: string;
  plan: 'premium' | 'pro';
  status: 'active' | 'inactive' | 'cancelled';
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  price: number;
  currency: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'ticket' | 'merchandise' | 'tip';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  description: string;
  createdAt: string;
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  referredUserId: string;
  rewardType: 'commission' | 'bonus' | 'discount';
  amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface DashboardStats {
  totalViews: number;
  totalRevenue: number;
  ticketsSold: number;
  followers: number;
  engagement: number;
  monthlyGrowth: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type Language = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt';