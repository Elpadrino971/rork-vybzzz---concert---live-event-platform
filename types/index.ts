export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  isArtist: boolean;
  isPro: boolean;
  followers: number;
  following: number;
  verified: boolean;
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