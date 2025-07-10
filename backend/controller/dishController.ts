import { Request, Response } from "express";
import dishService from "../services/dishService";
import { IDishSearchQuery, IIngredientsQuery } from "../utils/types";

class DishController {
    /**
     * GET /api/dishes
     * Fetch all dishes in the system
     */
    async fetchAllDishes(req: Request, res: Response): Promise<void> {
        try {
            const dishes = await dishService.getAllDishes();
            res.status(200).json({
                success: true,
                count: dishes.length,
                data: dishes
            });
        } catch (error) {
            console.error("Error fetching all dishes:", error);
            res.status(500).json({
                success: false,
                message: "Error retrieving dishes list",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * GET /api/dishes/:name
     * Find data about a specific dish by name
     */
    async getDishByName(req: Request, res: Response): Promise<void> {
        try {
            const { name } = req.params;

            if (!name) {
                res.status(400).json({
                    success: false,
                    message: "Dish name is required"
                });
                return;
            }

            const dish = await dishService.getDishByName(name);

            if (!dish) {
                res.status(404).json({
                    success: false,
                    message: `Dish '${name}' not found`
                });
                return;
            }

            res.status(200).json({
                success: true,
                data: dish
            });
        } catch (error) {
            console.error("Error fetching dish by name:", error);
            res.status(500).json({
                success: false,
                message: "Error retrieving dish data",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * POST /api/dishes/by-ingredients
     * Find all possible dishes to make given a set of available ingredients
     */
    async getDishesByIngredients(req: Request, res: Response): Promise<void> {
        try {
            const { available_ingredients }: IIngredientsQuery = req.body;

            if (!available_ingredients || !Array.isArray(available_ingredients) || available_ingredients.length === 0) {
                res.status(400).json({
                    success: false,
                    message: "available_ingredients array is required and must not be empty"
                });
                return;
            }

            const dishes = await dishService.getDishesByAvailableIngredients(available_ingredients);

            res.status(200).json({
                success: true,
                count: dishes.length,
                available_ingredients,
                data: dishes
            });
        } catch (error) {
            console.error("Error fetching dishes by ingredients:", error);
            res.status(500).json({
                success: false,
                message: "Error retrieving dishes by ingredients",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * GET /api/dishes/search
     * Advanced search with multiple filters using query parameters
     * Supports LHS Brackets notation for ranges (e.g., prep_time[gte]=10&prep_time[lte]=30)
     */
    async searchDishes(req: Request, res: Response): Promise<void> {
        try {
            const query: IDishSearchQuery = {};

            // Simple string/enum filters
            if (req.query.name) query.name = req.query.name as string;
            if (req.query.diet) query.diet = req.query.diet as any;
            if (req.query.flavor_profile) query.flavor_profile = req.query.flavor_profile as any;
            if (req.query.course) query.course = req.query.course as any;
            if (req.query.state) query.state = req.query.state as string;
            if (req.query.region) query.region = req.query.region as any;

            // Ingredients filter (comma-separated)
            if (req.query.ingredients) {
                const ingredientsString = req.query.ingredients as string;
                query.ingredients = ingredientsString.split(',').map(ing => ing.trim()).filter(ing => ing.length > 0);
            }

            // LHS Brackets notation for prep_time
            if (req.query['prep_time[gte]'] || req.query['prep_time[lte]']) {
                query.prep_time = {};
                if (req.query['prep_time[gte]']) {
                    query.prep_time.gte = parseInt(req.query['prep_time[gte]'] as string);
                }
                if (req.query['prep_time[lte]']) {
                    query.prep_time.lte = parseInt(req.query['prep_time[lte]'] as string);
                }
            }

            // LHS Brackets notation for cook_time
            if (req.query['cook_time[gte]'] || req.query['cook_time[lte]']) {
                query.cook_time = {};
                if (req.query['cook_time[gte]']) {
                    query.cook_time.gte = parseInt(req.query['cook_time[gte]'] as string);
                }
                if (req.query['cook_time[lte]']) {
                    query.cook_time.lte = parseInt(req.query['cook_time[lte]'] as string);
                }
            }

            const dishes = await dishService.searchDishes(query);

            res.status(200).json({
                success: true,
                count: dishes.length,
                query,
                data: dishes
            });
        } catch (error) {
            console.error("Error searching dishes:", error);
            res.status(500).json({
                success: false,
                message: "Error searching dishes",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * GET /api/dishes/filters
     * Get all unique filter values for dropdowns/suggestions
     */
    async getFilterOptions(req: Request, res: Response): Promise<void> {
        try {
            const filterOptions = await dishService.getUniqueValues();

            res.status(200).json({
                success: true,
                data: filterOptions
            });
        } catch (error) {
            console.error("Error fetching filter options:", error);
            res.status(500).json({
                success: false,
                message: "Error retrieving filter options",
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

export default new DishController();
