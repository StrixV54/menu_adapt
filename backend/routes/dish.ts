import { Router } from "express";
import dishController from "../controller/dishController";

const router: Router = Router();

// Core mandatory endpoints
router.get("/dishes", dishController.fetchAllDishes);
router.get("/dishes/search", dishController.searchDishes);
router.get("/dishes/filters", dishController.getFilterOptions);
router.get("/dishes/:name", dishController.getDishByName);
router.post("/dishes/by-ingredients", dishController.getDishesByIngredients);

export default router;
