import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  profilePicture: text("profile_picture"),
  companyLogo: text("company_logo"),
  // Subscription fields
  plan: text("plan").default("Free").notNull(), // Basic, Pro, Enterprise
  subscriptionStatus: text("subscription_status").default("trial").notNull(), // trial, active, canceled, expired
  trialEndsAt: timestamp("trial_ends_at"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // Business info fields
  businessName: text("business_name"),
  industry: text("industry"),
  clientType: text("client_type"), // Med Spa, Dental Office, etc.
  clientTypeCustom: text("client_type_custom"), // For "Other" selection
  isAgency: boolean("is_agency").default(false), // Flag for agency clients
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  // AI preferences
  aiDefaultTone: text("ai_default_tone").default("professional"),
  aiAutoReplyToFiveStars: boolean("ai_auto_reply_to_five_stars").default(false),
  notificationFrequency: text("notification_frequency").default("daily"),
  // Onboarding status
  onboardingCompleted: boolean("onboarding_completed").default(false),
  role: text("role").default("user").notNull(), // Options: admin, user, staff
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  profilePicture: true,
  companyLogo: true,
  plan: true,
  subscriptionStatus: true,
  trialEndsAt: true,
  subscriptionEndsAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  // Business info fields
  businessName: true,
  industry: true,
  clientType: true,
  clientTypeCustom: true,
  isAgency: true,
  contactName: true,
  contactEmail: true,
  contactPhone: true,
  // AI preferences
  aiDefaultTone: true,
  aiAutoReplyToFiveStars: true,
  notificationFrequency: true,
  // Onboarding status
  onboardingCompleted: true,
});

// Review table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  locationId: integer("location_id"),
  reviewerName: text("reviewer_name").notNull(),
  platform: text("platform").notNull(), // e.g., "Google", "Yelp"
  rating: real("rating").notNull(), // 1-5 rating
  reviewText: text("review_text").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  response: text("response"),
  externalId: text("external_id"), // ID from external platform (Google, Yelp)
  sentimentScore: real("sentiment_score"),
  sentiment: text("sentiment"), // positive, neutral, negative
  keywords: jsonb("keywords"),
  ai_replied: boolean("ai_replied").default(false), // Whether an AI reply has been generated
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  locationId: true,
  reviewerName: true,
  platform: true,
  rating: true, 
  reviewText: true,
  date: true,
  isResolved: true,
  response: true,
  externalId: true,
  sentimentScore: true,
  sentiment: true,
  keywords: true,
  ai_replied: true,
});

// Metrics table for storing aggregated metrics
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  averageRating: real("average_rating"), 
  totalReviews: integer("total_reviews"),
  positivePercentage: real("positive_percentage"),
  keywordTrends: jsonb("keyword_trends"), // JSON data for keyword trends
});

export const insertMetricsSchema = createInsertSchema(metrics).pick({
  userId: true,
  date: true,
  averageRating: true, 
  totalReviews: true,
  positivePercentage: true,
  keywordTrends: true,
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  alertType: text("alert_type").notNull(), // e.g., "negative_review", "keyword_trend"
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  isRead: boolean("is_read").default(false).notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  userId: true,
  alertType: true,
  content: true,
  date: true,
  isRead: true,
});

// AI Replies table
export const aiReplies = pgTable("ai_replies", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").notNull().references(() => reviews.id, { onDelete: "cascade" }),
  reply_text: text("reply_text").notNull(),
  tone: text("tone").notNull().default("professional"),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertAiReplySchema = createInsertSchema(aiReplies).pick({
  reviewId: true,
  reply_text: true,
  tone: true,
  approved: true,
  updatedAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type Metrics = typeof metrics.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export type InsertAiReply = z.infer<typeof insertAiReplySchema>;
export type AiReply = typeof aiReplies.$inferSelect;

// Locations table for multi-location management
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  googlePlaceId: text("google_place_id"),
  yelpBusinessId: text("yelp_business_id"),
  facebookPageId: text("facebook_page_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLocationSchema = createInsertSchema(locations).pick({
  userId: true,
  name: true,
  address: true,
  phone: true,
  email: true,
  googlePlaceId: true,
  yelpBusinessId: true,
  facebookPageId: true,
});

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

// Review templates table for customizable review request messages
export const reviewTemplates = pgTable("review_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false),
  templateType: text("template_type").default("email").notNull(), // email, sms
  isHipaaSafe: boolean("is_hipaa_safe").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewTemplateSchema = createInsertSchema(reviewTemplates).pick({
  userId: true,
  name: true,
  content: true,
  isDefault: true,
  templateType: true,
  isHipaaSafe: true,
});

export type InsertReviewTemplate = z.infer<typeof insertReviewTemplateSchema>;
export type ReviewTemplate = typeof reviewTemplates.$inferSelect;

// Review requests table for tracking outreach to customers
export const reviewRequests = pgTable("review_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  locationId: integer("location_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  templateId: integer("template_id"),
  status: text("status").notNull().default("pending"), // pending, sent, completed
  sentAt: timestamp("sent_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  source: text("source").default("manual").notNull(), // manual, automated
});

export const insertReviewRequestSchema = createInsertSchema(reviewRequests).pick({
  userId: true,
  locationId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  templateId: true,
  status: true,
  source: true,
});

export type InsertReviewRequest = z.infer<typeof insertReviewRequestSchema>;
export type ReviewRequest = typeof reviewRequests.$inferSelect;

// Competitors table for competitor benchmarking
export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  googleUrl: text("google_url"),
  yelpUrl: text("yelp_url"),
  otherUrls: jsonb("other_urls"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCompetitorSchema = createInsertSchema(competitors).pick({
  userId: true,
  name: true,
  googleUrl: true,
  yelpUrl: true,
  otherUrls: true,
  notes: true,
});

export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;
export type Competitor = typeof competitors.$inferSelect;

// Competitor analysis results
export const competitorReports = pgTable("competitor_reports", {
  id: serial("id").primaryKey(),
  competitorId: integer("competitor_id").notNull(),
  reportDate: timestamp("report_date").notNull().defaultNow(),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count"),
  sentiment: jsonb("sentiment"),
  keywordAnalysis: jsonb("keyword_analysis"),
  strengths: jsonb("strengths"),
  weaknesses: jsonb("weaknesses"),
});

export const insertCompetitorReportSchema = createInsertSchema(competitorReports).pick({
  competitorId: true,
  reportDate: true,
  averageRating: true,
  reviewCount: true,
  sentiment: true,
  keywordAnalysis: true,
  strengths: true,
  weaknesses: true,
});

export type InsertCompetitorReport = z.infer<typeof insertCompetitorReportSchema>;
export type CompetitorReport = typeof competitorReports.$inferSelect;

// White-label agency tables
export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Agency owner
  name: text("name").notNull(),
  domain: text("domain").unique(), // Custom domain
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#3b82f6"),
  secondaryColor: text("secondary_color").default("#1e40af"),
  customCss: text("custom_css"),
  customJs: text("custom_js"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgencySchema = createInsertSchema(agencies).pick({
  userId: true,
  name: true,
  domain: true,
  logoUrl: true,
  primaryColor: true,
  secondaryColor: true,
  customCss: true,
  customJs: true,
});

export type InsertAgency = z.infer<typeof insertAgencySchema>;
export type Agency = typeof agencies.$inferSelect;

// Agency clients junction table
export const agencyClients = pgTable("agency_clients", {
  id: serial("id").primaryKey(),
  agencyId: integer("agency_id").notNull(),
  clientUserId: integer("client_user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgencyClientSchema = createInsertSchema(agencyClients).pick({
  agencyId: true,
  clientUserId: true,
});

export type InsertAgencyClient = z.infer<typeof insertAgencyClientSchema>;
export type AgencyClient = typeof agencyClients.$inferSelect;

// Define relationships between tables

// User relations
export const usersRelations = relations(users, ({ many, one }) => ({
  reviews: many(reviews),
  locations: many(locations),
  alerts: many(alerts),
  metrics: many(metrics),
  reviewTemplates: many(reviewTemplates),
  reviewRequests: many(reviewRequests),
  competitors: many(competitors),
  ownedAgencies: many(agencies),
  crmIntegrations: many(crmIntegrations),
  managedLocations: many(locationManagers),
  healthcareSettings: one(healthcareSettings),
}));

// Review relations
export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [reviews.locationId],
    references: [locations.id],
  }),
  aiReplies: many(aiReplies),
}));

// Location relations
export const locationsRelations = relations(locations, ({ one, many }) => ({
  user: one(users, {
    fields: [locations.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
  reviewRequests: many(reviewRequests),
  reviewInvites: many(reviewInvites),
  managers: many(locationManagers),
}));

// Alert relations
export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
}));

// Metrics relations
export const metricsRelations = relations(metrics, ({ one }) => ({
  user: one(users, {
    fields: [metrics.userId],
    references: [users.id],
  }),
}));

// Review templates relations
export const reviewTemplatesRelations = relations(reviewTemplates, ({ one, many }) => ({
  user: one(users, {
    fields: [reviewTemplates.userId],
    references: [users.id],
  }),
  reviewRequests: many(reviewRequests),
}));

// Review requests relations
export const reviewRequestsRelations = relations(reviewRequests, ({ one }) => ({
  user: one(users, {
    fields: [reviewRequests.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [reviewRequests.locationId],
    references: [locations.id],
  }),
  template: one(reviewTemplates, {
    fields: [reviewRequests.templateId],
    references: [reviewTemplates.id],
  }),
}));

// Competitor relations
export const competitorsRelations = relations(competitors, ({ one, many }) => ({
  user: one(users, {
    fields: [competitors.userId],
    references: [users.id],
  }),
  reports: many(competitorReports),
}));

// Competitor reports relations
export const competitorReportsRelations = relations(competitorReports, ({ one }) => ({
  competitor: one(competitors, {
    fields: [competitorReports.competitorId],
    references: [competitors.id],
  }),
}));

// Agency relations
export const agenciesRelations = relations(agencies, ({ one, many }) => ({
  owner: one(users, {
    fields: [agencies.userId],
    references: [users.id],
  }),
  clients: many(agencyClients),
}));

// Agency clients relations
export const agencyClientsRelations = relations(agencyClients, ({ one }) => ({
  agency: one(agencies, {
    fields: [agencyClients.agencyId],
    references: [agencies.id],
  }),
  client: one(users, {
    fields: [agencyClients.clientUserId],
    references: [users.id],
  }),
}));

// Review invites table for healthcare appointment-based review request simulation
export const reviewInvites = pgTable("review_invites", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  patientName: text("patient_name").notNull(),
  method: text("method").notNull(), // email, sms
  status: text("status").notNull().default("pending"), // pending, sent, opened, clicked
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  reviewId: integer("review_id"), // if they left a review, link to it
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewInviteSchema = createInsertSchema(reviewInvites).pick({
  locationId: true,
  patientName: true,
  method: true,
  status: true,
  sentAt: true,
  deliveredAt: true,
  openedAt: true,
  clickedAt: true,
  reviewId: true,
  notes: true,
});

export type InsertReviewInvite = z.infer<typeof insertReviewInviteSchema>;
export type ReviewInvite = typeof reviewInvites.$inferSelect;

// Review invites relations
export const reviewInvitesRelations = relations(reviewInvites, ({ one }) => ({
  location: one(locations, {
    fields: [reviewInvites.locationId],
    references: [locations.id],
  }),
  review: one(reviews, {
    fields: [reviewInvites.reviewId],
    references: [reviews.id],
  }),
}));

// Healthcare-specific settings table
export const healthcareSettings = pgTable("healthcare_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  enableReviewAutomation: boolean("enable_review_automation").default(false),
  requestDelay: text("request_delay").default("immediately"), // immediately, 1hour, 24hours
  defaultTemplateId: integer("default_template_id"),
  googleProfileLink: text("google_profile_link"),
  usePatientTerminology: boolean("use_patient_terminology").default(true),
  hipaaMode: boolean("hipaa_mode").default(true),
  // EHR integration fields
  // DrChrono
  drchronoEnabled: boolean("drchrono_enabled").default(false),
  drchronoClientId: text("drchrono_client_id"),
  drchronoClientSecret: text("drchrono_client_secret"),
  drchronoRefreshToken: text("drchrono_refresh_token"),
  
  // Jane App
  janeappEnabled: boolean("janeapp_enabled").default(false),
  janeappApiKey: text("janeapp_api_key"),
  janeappApiSecret: text("janeapp_api_secret"),
  
  // Symplast (Plastic Surgery, Aesthetics)
  symplastEnabled: boolean("symplast_enabled").default(false),
  symplastApiKey: text("symplast_api_key"),
  symplastApiSecret: text("symplast_api_secret"),
  symplastInstance: text("symplast_instance"),
  
  // Aesthetic Record (Med Spas, Cosmetic)
  aestheticRecordEnabled: boolean("aesthetic_record_enabled").default(false),
  aestheticRecordApiKey: text("aesthetic_record_api_key"),
  aestheticRecordUsername: text("aesthetic_record_username"),
  aestheticRecordPassword: text("aesthetic_record_password"),
  
  // Open Dental (Dental)
  openDentalEnabled: boolean("open_dental_enabled").default(false),
  openDentalApiKey: text("open_dental_api_key"),
  openDentalServerUrl: text("open_dental_server_url"),
  openDentalUsername: text("open_dental_username"),
  openDentalPassword: text("open_dental_password"),
  
  // Dentrix (Dental)
  dentrixEnabled: boolean("dentrix_enabled").default(false),
  dentrixApiKey: text("dentrix_api_key"),
  dentrixCustomerId: text("dentrix_customer_id"),
  dentrixInstanceKey: text("dentrix_instance_key"),
  
  // ChiroFusion (Chiropractic)
  chirofusionEnabled: boolean("chirofusion_enabled").default(false),
  chirofusionApiKey: text("chirofusion_api_key"),
  chirofusionUsername: text("chirofusion_username"),
  chirofusionPassword: text("chirofusion_password"),
  
  // Athenahealth
  athenahealthEnabled: boolean("athenahealth_enabled").default(false),
  athenahealthApiKey: text("athenahealth_api_key"),
  athenahealthApiSecret: text("athenahealth_api_secret"),
  athenahealthPracticeId: text("athenahealth_practice_id"),
  
  // Tebra (Kareo)
  tebraEnabled: boolean("tebra_enabled").default(false),
  tebraApiKey: text("tebra_api_key"),
  tebraAccountId: text("tebra_account_id"),
  tebraUsername: text("tebra_username"),
  tebraPassword: text("tebra_password"),
  
  // Cerner
  cernerEnabled: boolean("cerner_enabled").default(false),
  cernerClientId: text("cerner_client_id"),
  cernerClientSecret: text("cerner_client_secret"),
  cernerTenantId: text("cerner_tenant_id"),
  
  // Epic
  epicEnabled: boolean("epic_enabled").default(false),
  epicClientId: text("epic_client_id"),
  epicClientSecret: text("epic_client_secret"),
  epicFhirUrl: text("epic_fhir_url"),
  
  // eClinicalWorks
  eclinicalworksEnabled: boolean("eclinicalworks_enabled").default(false),
  eclinicalworksApiKey: text("eclinicalworks_api_key"),
  eclinicalworksUsername: text("eclinicalworks_username"),
  eclinicalworksPassword: text("eclinicalworks_password"),
  primaryLocationId: integer("primary_location_id"),
  autoSendReviewRequests: boolean("auto_send_review_requests").default(true),
  defaultReviewPlatform: text("default_review_platform").default("google"),
  lastPolledAt: timestamp("last_polled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertHealthcareSettingsSchema = createInsertSchema(healthcareSettings).pick({
  userId: true,
  enableReviewAutomation: true,
  requestDelay: true,
  defaultTemplateId: true,
  googleProfileLink: true,
  usePatientTerminology: true,
  hipaaMode: true,
  // EHR integration fields
  // DrChrono
  drchronoEnabled: true,
  drchronoClientId: true,
  drchronoClientSecret: true,
  drchronoRefreshToken: true,
  
  // Jane App
  janeappEnabled: true,
  janeappApiKey: true,
  janeappApiSecret: true,
  
  // Symplast
  symplastEnabled: true,
  symplastApiKey: true,
  symplastApiSecret: true,
  symplastInstance: true,
  
  // Aesthetic Record
  aestheticRecordEnabled: true,
  aestheticRecordApiKey: true,
  aestheticRecordUsername: true,
  aestheticRecordPassword: true,
  
  // Open Dental
  openDentalEnabled: true,
  openDentalApiKey: true,
  openDentalServerUrl: true,
  openDentalUsername: true,
  openDentalPassword: true,
  
  // Dentrix
  dentrixEnabled: true,
  dentrixApiKey: true,
  dentrixCustomerId: true,
  dentrixInstanceKey: true,
  
  // ChiroFusion
  chirofusionEnabled: true,
  chirofusionApiKey: true,
  chirofusionUsername: true,
  chirofusionPassword: true,
  
  // Athenahealth
  athenahealthEnabled: true,
  athenahealthApiKey: true,
  athenahealthApiSecret: true,
  athenahealthPracticeId: true,
  
  // Tebra
  tebraEnabled: true,
  tebraApiKey: true,
  tebraAccountId: true,
  tebraUsername: true,
  tebraPassword: true,
  
  // Cerner
  cernerEnabled: true,
  cernerClientId: true,
  cernerClientSecret: true,
  cernerTenantId: true,
  
  // Epic
  epicEnabled: true,
  epicClientId: true,
  epicClientSecret: true,
  epicFhirUrl: true,
  
  // eClinicalWorks
  eclinicalworksEnabled: true,
  eclinicalworksApiKey: true,
  eclinicalworksUsername: true,
  eclinicalworksPassword: true,
  primaryLocationId: true,
  autoSendReviewRequests: true,
  defaultReviewPlatform: true,
  updatedAt: true,
});

export type InsertHealthcareSettings = z.infer<typeof insertHealthcareSettingsSchema>;
export type HealthcareSettings = typeof healthcareSettings.$inferSelect;

// Healthcare settings relations
export const healthcareSettingsRelations = relations(healthcareSettings, ({ one }) => ({
  user: one(users, {
    fields: [healthcareSettings.userId],
    references: [users.id],
  }),
  defaultTemplate: one(reviewTemplates, {
    fields: [healthcareSettings.defaultTemplateId],
    references: [reviewTemplates.id],
  }),
}));

// AI Reply relations
export const aiRepliesRelations = relations(aiReplies, ({ one }) => ({
  review: one(reviews, {
    fields: [aiReplies.reviewId],
    references: [reviews.id],
  }),
}));

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Free, Basic, Pro, Enterprise
  displayName: text("display_name").notNull(), // Display name shown on pricing page
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents per month
  annualPrice: integer("annual_price"), // Annual price in cents (optional)
  trialDays: integer("trial_days").default(14).notNull(),
  features: jsonb("features").notNull(), // Array of features
  maxLocations: integer("max_locations").default(1).notNull(),
  maxUsers: integer("max_users").default(1).notNull(),
  isPopular: boolean("is_popular").default(false),
  isAvailable: boolean("is_available").default(true).notNull(),
  stripePriceId: text("stripe_price_id"), // For Stripe integration
  stripeAnnualPriceId: text("stripe_annual_price_id"), // For annual billing
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).pick({
  name: true,
  displayName: true,
  description: true,
  price: true,
  annualPrice: true,
  trialDays: true,
  features: true,
  maxLocations: true,
  maxUsers: true,
  isPopular: true,
  isAvailable: true,
  stripePriceId: true,
  stripeAnnualPriceId: true,
});

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// CRM Integrations table
export const crmIntegrations = pgTable("crm_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  crmType: text("crm_type").notNull(), // housecallpro, servicetitan, mindbody, etc.
  apiKey: text("api_key").notNull(),
  triggerEvent: text("trigger_event").notNull(), // appointment_completed, treatment_finished, etc.
  templateId: integer("template_id").notNull().references(() => reviewTemplates.id, { onDelete: "cascade" }),
  delayHours: integer("delay_hours").default(2),
  active: boolean("active").default(true),
  customEndpoint: text("custom_endpoint"),
  otherSettings: jsonb("other_settings").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSync: timestamp("last_sync"),
  requestsSent: integer("requests_sent").default(0),
});

export const insertCrmIntegrationSchema = createInsertSchema(crmIntegrations).pick({
  userId: true,
  name: true,
  crmType: true,
  apiKey: true,
  triggerEvent: true,
  templateId: true,
  delayHours: true,
  active: true,
  customEndpoint: true,
  otherSettings: true,
});

export type InsertCrmIntegration = z.infer<typeof insertCrmIntegrationSchema>;
export type CrmIntegration = typeof crmIntegrations.$inferSelect;

export const crmIntegrationsRelations = relations(crmIntegrations, ({ one }) => ({
  user: one(users, {
    fields: [crmIntegrations.userId],
    references: [users.id]
  }),
  template: one(reviewTemplates, {
    fields: [crmIntegrations.templateId],
    references: [reviewTemplates.id]
  })
}));

// Location managers table - for assigning users to manage specific locations
export const locationManagers = pgTable("location_managers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  locationId: integer("location_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLocationManagerSchema = createInsertSchema(locationManagers).pick({
  userId: true,
  locationId: true,
});

export type InsertLocationManager = z.infer<typeof insertLocationManagerSchema>;
export type LocationManager = typeof locationManagers.$inferSelect;

// Location manager relations
export const locationManagersRelations = relations(locationManagers, ({ one }) => ({
  user: one(users, {
    fields: [locationManagers.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [locationManagers.locationId],
    references: [locations.id],
  }),
}));

// Patient table for appointment-based review requests
export const patients = pgTable("patients", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  locationId: integer("location_id").references(() => locations.id),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  ehrId: varchar("ehr_id", { length: 255 }), // ID in the EHR system
  ehrSource: varchar("ehr_source", { length: 50 }).notNull(), // 'drchrono' or 'janeapp'
  lastAppointment: timestamp("last_appointment"), // Most recent appointment date
  reviewRequestSent: timestamp("review_request_sent"), // When review request was sent
  reviewCompleted: boolean("review_completed").default(false),
  reviewCompletedAt: timestamp("review_completed_at"),
  reviewPlatform: varchar("review_platform", { length: 50 }), // 'google', 'yelp', 'healthgrades', etc.
  rating: integer("rating"), // 1-5
  reviewId: integer("review_id").references(() => reviews.id), // Link to actual review if completed
  metadata: jsonb("metadata"), // Additional data from EHR
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patient Zod schema
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  reviewId: true,
  reviewCompletedAt: true,
  reviewSentAt: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

// Patient relations
export const patientRelations = relations(patients, ({ one }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [patients.locationId],
    references: [locations.id],
  }),
  review: one(reviews, {
    fields: [patients.reviewId],
    references: [reviews.id],
  }),
}));
