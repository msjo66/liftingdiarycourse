import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  date,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const weightUnitEnum = pgEnum('weight_unit', ['lbs', 'kg']);

export const exerciseCategoryEnum = pgEnum('exercise_category', [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'core',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'full_body',
  'cardio',
  'other',
]);

// ─── Users ────────────────────────────────────────────────────────────────────
// Local mirror of Clerk user. Created on first sign-in via Clerk webhook/middleware.
// clerkId is the stable FK referenced by workouts and exercises.

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ─── Exercises ────────────────────────────────────────────────────────────────
// userId NULL = global/system exercise. Non-null = user-created custom exercise.

export const exercises = pgTable(
  'exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    category: exerciseCategoryEnum('category').notNull(),
    userId: varchar('user_id', { length: 255 }).references(() => users.clerkId, {
      onDelete: 'cascade',
    }),
    description: text('description'),
    isArchived: boolean('is_archived').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('exercises_user_id_idx').on(t.userId),
    index('exercises_category_idx').on(t.category),
    uniqueIndex('exercises_name_user_unique_idx')
      .on(t.name, t.userId)
      .where(sql`user_id IS NOT NULL`),
    uniqueIndex('exercises_name_global_unique_idx')
      .on(t.name)
      .where(sql`user_id IS NULL`),
  ]
);

// ─── Workouts ─────────────────────────────────────────────────────────────────

export const workouts = pgTable(
  'workouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => users.clerkId, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    date: date('date', { mode: 'date' }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index('workouts_user_id_idx').on(t.userId),
    index('workouts_user_id_date_idx').on(t.userId, t.date),
  ]
);

// ─── Workout Exercises ────────────────────────────────────────────────────────

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutId: uuid('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    order: integer('order').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('workout_exercises_workout_id_idx').on(t.workoutId),
    index('workout_exercises_exercise_id_idx').on(t.exerciseId),
    uniqueIndex('workout_exercises_workout_order_unique_idx').on(t.workoutId, t.order),
  ]
);

// ─── Sets ─────────────────────────────────────────────────────────────────────

export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutExerciseId: uuid('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    reps: integer('reps'),
    weight: decimal('weight', { precision: 8, scale: 3 }),
    weightUnit: weightUnitEnum('weight_unit').notNull().default('lbs'),
    notes: text('notes'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('sets_workout_exercise_id_idx').on(t.workoutExerciseId),
    uniqueIndex('sets_set_number_unique_idx').on(t.workoutExerciseId, t.setNumber),
  ]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  user: one(users, { fields: [exercises.userId], references: [users.clerkId] }),
  workoutExercises: many(workoutExercises),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, { fields: [workouts.userId], references: [users.clerkId] }),
  workoutExercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, { fields: [workoutExercises.workoutId], references: [workouts.id] }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;
export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;
