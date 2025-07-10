import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { eq, and, gte, lte, like, inArray, or, ilike } from 'drizzle-orm';
import { db } from '../config/database';
import { dishes, type Dish, type NewDish } from '../config/schema';
import { IDish, IDishSearchQuery, IIngredientsQuery } from '../utils/types';

class DishService {
    private csvLoaded = false;

    constructor() {
        this.initializeDatabase();
    }

    private async initializeDatabase(): Promise<void> {
        try {
            // Check if data already exists in database
            const existingCount = await db.select().from(dishes);
            if (existingCount.length === 0) {
                console.log('Database is empty, loading data from CSV...');
                await this.loadCsvToDatabase();
            } else {
                console.log(`Database already contains ${existingCount.length} dishes`);
            }
        } catch (error) {
            console.error('Error initializing database:', error);
        }
    }

    private async loadCsvToDatabase(): Promise<void> {
        if (this.csvLoaded) return;

        return new Promise((resolve, reject) => {
            const csvPath = path.join(__dirname, '../records/indian_food.csv');
            const dishesToInsert: NewDish[] = [];

            fs.createReadStream(csvPath)
                .pipe(csv())
                .on('data', (row: any) => {
                    try {
                        const dish: NewDish = {
                            name: row.name?.trim() || '',
                            ingredients: this.parseIngredients(row.ingredients),
                            diet: this.parseDiet(row.diet),
                            prep_time: this.parseTime(row.prep_time),
                            cook_time: this.parseTime(row.cook_time),
                            flavor_profile: this.parseFlavorProfile(row.flavor_profile),
                            course: this.parseCourse(row.course),
                            state: this.parseState(row.state),
                            region: this.parseRegion(row.region)
                        };
                        dishesToInsert.push(dish);
                    } catch (error) {
                        console.warn(`Error parsing dish row:`, error);
                    }
                })
                .on('end', async () => {
                    try {
                        // Insert all dishes in batches
                        console.log(`Inserting ${dishesToInsert.length} dishes into database...`);
                        await db.insert(dishes).values(dishesToInsert);
                        console.log(`Successfully loaded ${dishesToInsert.length} dishes from CSV to database`);
                        this.csvLoaded = true;
                        resolve();
                    } catch (insertError) {
                        console.error('Error inserting dishes:', insertError);
                        reject(insertError);
                    }
                })
                .on('error', (error) => {
                    console.error('Error reading CSV file:', error);
                    reject(error);
                });
        });
    }

    private parseIngredients(ingredientsString: string): string[] {
        if (!ingredientsString || ingredientsString.trim() === '') return [];
        return ingredientsString
            .split(',')
            .map(ingredient => ingredient.trim())
            .filter(ingredient => ingredient.length > 0);
    }

    private parseDiet(diet: string): 'vegetarian' | 'non vegetarian' {
        const cleanDiet = diet?.trim().toLowerCase();
        return cleanDiet === 'non vegetarian' ? 'non vegetarian' : 'vegetarian';
    }

    private parseTime(timeString: string): number | null {
        if (!timeString || timeString.trim() === '' || timeString === '-1') return null;
        const time = parseInt(timeString.trim());
        return isNaN(time) || time < 0 ? null : time;
    }

    private parseFlavorProfile(flavor: string): 'sweet' | 'spicy' | 'bitter' | 'sour' | null {
        const cleanFlavor = flavor?.trim().toLowerCase();
        const validFlavors = ['sweet', 'spicy', 'bitter', 'sour'];
        return validFlavors.includes(cleanFlavor) ? cleanFlavor as any : null;
    }

    private parseCourse(course: string): 'main course' | 'dessert' | 'snack' | 'starter' {
        const cleanCourse = course?.trim().toLowerCase();
        const validCourses = ['main course', 'dessert', 'snack', 'starter'];
        return validCourses.includes(cleanCourse) ? cleanCourse as any : 'main course';
    }

    private parseState(state: string): string | null {
        if (!state || state.trim() === '' || state.trim() === '-1') return null;
        return state.trim();
    }

    private parseRegion(region: string): 'North' | 'South' | 'East' | 'West' | 'North East' | 'Central' | null {
        if (!region || region.trim() === '' || region.trim() === '-1') return null;
        const cleanRegion = region.trim();
        const validRegions = ['North', 'South', 'East', 'West', 'North East', 'Central'];
        return validRegions.includes(cleanRegion) ? cleanRegion as any : null;
    }

        async getAllDishes(): Promise<Dish[]> {
        return await db.select().from(dishes);
    }

    async getDishByName(name: string): Promise<Dish | null> {
        const result = await db
            .select()
            .from(dishes)
            .where(ilike(dishes.name, name));

        return result[0] || null;
    }

        async searchDishes(query: IDishSearchQuery): Promise<Dish[]> {
        const conditions: any[] = [];

        // Name search (partial match, case insensitive)
        if (query.name) {
            conditions.push(ilike(dishes.name, `%${query.name}%`));
        }

        // Diet filter
        if (query.diet) {
            conditions.push(eq(dishes.diet, query.diet));
        }

        // Flavor profile filter
        if (query.flavor_profile) {
            conditions.push(eq(dishes.flavor_profile, query.flavor_profile));
        }

        // Course filter
        if (query.course) {
            conditions.push(eq(dishes.course, query.course));
        }

        // State filter (case insensitive)
        if (query.state) {
            conditions.push(ilike(dishes.state, query.state));
        }

        // Region filter
        if (query.region) {
            conditions.push(eq(dishes.region, query.region));
        }

        // Prep time filters
        if (query.prep_time?.gte) {
            conditions.push(gte(dishes.prep_time, query.prep_time.gte));
        }
        if (query.prep_time?.lte) {
            conditions.push(lte(dishes.prep_time, query.prep_time.lte));
        }

        // Cook time filters
        if (query.cook_time?.gte) {
            conditions.push(gte(dishes.cook_time, query.cook_time.gte));
        }
        if (query.cook_time?.lte) {
            conditions.push(lte(dishes.cook_time, query.cook_time.lte));
        }

        // Execute query with conditions
        let results: Dish[];
        if (conditions.length > 0) {
            results = await db.select().from(dishes).where(and(...conditions));
        } else {
            results = await db.select().from(dishes);
        }

        // Handle ingredient filtering (requires array operations)
        if (query.ingredients && query.ingredients.length > 0) {
            results = results.filter(dish => {
                const dishIngredients = dish.ingredients.map(ing => ing.toLowerCase());
                return query.ingredients!.every(queryIng =>
                    dishIngredients.some(dishIng =>
                        dishIng.includes(queryIng.toLowerCase())
                    )
                );
            });
        }

        return results;
    }

    async getDishesByAvailableIngredients(availableIngredients: string[]): Promise<Dish[]> {
        if (!availableIngredients || availableIngredients.length === 0) {
            return [];
        }

        const normalizedAvailable = availableIngredients.map(ing => ing.toLowerCase().trim());
        const allDishes = await this.getAllDishes();

        return allDishes.filter(dish => {
            // Check if ALL ingredients of the dish are available
            return dish.ingredients.every(dishIngredient =>
                normalizedAvailable.some(availableIng =>
                    dishIngredient.toLowerCase().includes(availableIng) ||
                    availableIng.includes(dishIngredient.toLowerCase())
                )
            );
        });
    }

    async getUniqueValues(): Promise<{
        states: string[];
        regions: string[];
        courses: string[];
        flavorProfiles: string[];
        diets: string[];
    }> {
        const allDishes = await this.getAllDishes();

        return {
            states: [...new Set(allDishes.map(d => d.state).filter(Boolean) as string[])].sort(),
            regions: [...new Set(allDishes.map(d => d.region).filter(Boolean) as string[])].sort(),
            courses: [...new Set(allDishes.map(d => d.course))].sort(),
            flavorProfiles: [...new Set(allDishes.map(d => d.flavor_profile).filter(Boolean) as string[])].sort(),
            diets: [...new Set(allDishes.map(d => d.diet))].sort()
        };
    }
}

export default new DishService();
