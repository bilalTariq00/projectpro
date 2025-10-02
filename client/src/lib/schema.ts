// Frontend-only schema types (no database imports)
import { z } from "zod";

// Basic types for frontend use
export type User = {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  roleId?: number;
  type: string;
  isActive: boolean;
  language: string;
  createdAt: Date;
};

export type Client = {
  id: number;
  name: string;
  type: string;
  phone?: string;
  email?: string;
  address?: string;
  geoLocation?: string;
  notes?: string;
  createdAt: Date;
};

export type Job = {
  id: number;
  title: string;
  clientId: number;
  type: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  duration: number;
  hourlyRate: number;
  materialsCost: number;
  cost: number;
  laborCost: number;
  location?: string;
  notes?: string;
  assignedUserId?: number;
  createdAt: Date;
  completedDate?: Date;
  actualDuration?: number;
  photos?: string;
};

export type Activity = {
  id: number;
  name: string;
  jobTypeId: number;
  description?: string;
  defaultDuration?: number;
  defaultRate?: number;
  defaultCost?: number;
};

export type JobType = {
  id: number;
  name: string;
  description?: string;
};

export type Role = {
  id: number;
  name: string;
  description?: string;
  permissions?: string;
};

export type Collaborator = {
  id: number;
  name: string;
  roleId?: number;
  phone?: string;
  email?: string;
  isActive: boolean;
  language: string;
};

export type SubscriptionPlan = {
  id: number;
  name: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
  isFree: boolean;
  features?: string;
  createdAt: Date;
};

export type PromotionalSpot = {
  id: number;
  title: string;
  content?: string;
  redirectUrl?: string;
  enableRedirect: boolean;
  images?: string;
  status: string;
  position: string;
  createdAt: Date;
};

// Form validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  roleId: z.number().optional(),
  type: z.string().default("admin"),
  isActive: z.boolean().default(true),
  language: z.string().default("it"),
});

export const insertClientSchema = z.object({
  name: z.string().min(1),
  type: z.string().default('residential'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  geoLocation: z.string().optional(),
  notes: z.string().optional(),
});

export const insertJobSchema = z.object({
  title: z.string().min(1),
  clientId: z.number(),
  type: z.string(),
  status: z.string().default('scheduled'),
  startDate: z.string(),
  endDate: z.string().optional(),
  duration: z.number(),
  hourlyRate: z.number(),
  materialsCost: z.number().default(0),
  cost: z.number().default(0),
  laborCost: z.number().default(0),
  location: z.string().optional(),
  notes: z.string().optional(),
  assignedUserId: z.number().optional(),
});

export const insertPromotionalSpotSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  redirectUrl: z.string().optional(),
  enableRedirect: z.boolean().default(false),
  images: z.string().optional(),
  textAnimationType: z.string().default("fixed"),
  imageDisplayType: z.string().default("single"),
  status: z.string().default("inactive"),
  timeRanges: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dailyFrequency: z.number().default(1),
  weeklySchedule: z.string().optional(),
  visiblePages: z.string().default('all'),
  position: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  displayDuration: z.number().default(10),
  displayInterval: z.number().default(0),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type InsertPromotionalSpot = z.infer<typeof insertPromotionalSpotSchema>;

// Add WebPage schema for frontend forms
export const insertWebPageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().min(1),
  type: z.string().default("desktop"),
  status: z.string().default("draft"),
  featuredImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  authorId: z.number(),
  isHomepage: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export type WebPage = {
  id: number;
  title: string;
  slug: string;
  content: string;
  type: string;
  status: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  authorId: number;
  isHomepage: boolean;
  sortOrder: number;
};
