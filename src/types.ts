import React from 'react';

export enum ViewState {
  LANDING = 'LANDING',
  DEMO = 'DEMO',
  PORTAL = 'PORTAL',
  PRICING = 'PRICING'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  groundingMetadata?: any;
}

export interface ChartDataPoint {
  month: string;
  cost: number;
  savings: number;
}

export interface Service {
  id: string;
  slug?: string;
  title: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  details?: {
    fullDescription: string;
    benefits: string[];
    process: string[];
  };
}

export interface Industry extends Service {}

export interface PricingPackage {
  id: string;
  title: string;
  price: number | string;
  period: string;
  features: string[];
  targetAudience: string;
  isPopular?: boolean;
}

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  duration: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}