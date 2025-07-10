import { pgTable, text, integer, varchar, pgEnum, timestamp, serial } from 'drizzle-orm/pg-core';

// Define enums for constrained fields
export const dietEnum = pgEnum('diet', ['vegetarian', 'non vegetarian']);
export const flavorProfileEnum = pgEnum('flavor_profile', ['sweet', 'spicy', 'bitter', 'sour']);
export const courseEnum = pgEnum('course', ['main course', 'dessert', 'snack', 'starter']);
export const regionEnum = pgEnum('region', ['North', 'South', 'East', 'West', 'North East', 'Central']);

// Define the dishes table
export const dishes = pgTable('dishes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  ingredients: text('ingredients').array().notNull(), // PostgreSQL array of text
  diet: dietEnum('diet').notNull(),
  prep_time: integer('prep_time'), // nullable
  cook_time: integer('cook_time'), // nullable
  flavor_profile: flavorProfileEnum('flavor_profile'), // nullable
  course: courseEnum('course').notNull(),
  state: varchar('state', { length: 100 }), // nullable
  region: regionEnum('region'), // nullable
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export type Dish = typeof dishes.$inferSelect;
export type NewDish = typeof dishes.$inferInsert;
