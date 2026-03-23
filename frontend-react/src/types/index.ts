// Types pour les props des composants

export interface BaseComponentProps {
  id?: string;
  className?: string;
}

export interface PlanCardProps {
  title: string;
  price: string;
  priceLabel?: string;
  description: string;
  features: string[];
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary' | 'free' | 'campus';
  highlight?: boolean;
}

export interface TestimonialProps {
  quote: string;
  author: string;
}

export interface MenuItem {
  text: string;
  href: string;
}

export interface TestimonialsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt?: Date;
}
