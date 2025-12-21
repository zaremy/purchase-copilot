import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vin: text("vin").notNull(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  price: integer("price").notNull().default(0),
  mileage: integer("mileage").notNull().default(0),
  color: text("color"),
  titleStatus: text("title_status"),
  image: text("image"),
  bodyType: text("body_type").notNull().default('other'),
  riskScore: integer("risk_score").notNull().default(0),
  completeness: integer("completeness").notNull().default(0),
  status: text("status").notNull().default('active'),
  checklistResponses: jsonb("checklist_responses").notNull().default({}),
  notes: text("notes").notNull().default(''),
  engine: text("engine"),
  transmission: text("transmission"),
  drivetrain: text("drivetrain"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateVehicleSchema = insertVehicleSchema.partial();

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type UpdateVehicle = z.infer<typeof updateVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
