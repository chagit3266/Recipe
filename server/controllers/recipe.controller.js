import Recipe from '../models/Recipe.model.js'

import { addRecipeToCategories, removeRecipeFromCategories } from '../service/category.service.js'

export const getAllRecipe = async (req, res, next) => {
    try {
        const id = req.currentUser?._id || null
        let { search, limit, page } = req.query;
        const maxTime = parseInt(req.query.maxTime)
        let query = id ? {
            $or: [
                { isPrivate: false }, { isPrivate: true, 'owner._id': id },
            ],
        } : { isPrivate: false }
        if (search)
            query.name = { $regex: search, $options: 'i' }
        if (!isNaN(maxTime))
            query.preparationTime = { $lte: maxTime }

        // Calculate limit - ensure it's positive and reasonable
        const totalCount = await Recipe.countDocuments(query);
        limit = Math.max(parseInt(limit) || totalCount, 1); // ע"מ למנוע ערכים שליליים
        const skip = ((parseInt(page) || 1) - 1) * limit;
        let recipes = await Recipe.find(query).skip(skip).limit(limit)

        res.status(200).json(recipes);
    } catch (error) {
        next({ status: error.status, message: error.message });
    }
}
//אם הוא רוצה מתכון שהוא פרטי אז לא להחזיר
export const getRecipeById = async (req, res, next) => {
    try {
        const idOwner = req.currentUser?._id || null;
        // Support both URL params and query params for flexibility
        const recipeId = req.params.id || req.query._id;
        
        if (!recipeId) {
            return next({ status: 400, message: 'Recipe ID is required' });
        }
        
        let recipe = await Recipe.findById(recipeId);
        
        if (!recipe) {
            return next({ status: 404, message: 'Recipe not found' });
        }
        
        // Check if recipe is private and user is not the owner
        if (recipe.isPrivate && (!idOwner || recipe.owner._id.toString() !== idOwner.toString())) {
            return next({ status: 403, message: 'Access denied. This recipe is private.' });
        }
        
        res.status(200).json(recipe);
    } catch (error) {
        next({ status: error.status || 500, message: error.message });
    }
}

// export const getRecipeByPrepTime = async (req, res, next) => {
//     try {
//         const maxTime = parseInt(req.query.maxTime)
//         if (isNaN(maxTime))
//             return next({ status: 400, message: 'Invalid or missing maxPrepTime parameter' });
//         const id = req.currentUser?._id || null
//         let query = id ? {
//             $or: [
//                 { isPrivate: false }, { isPrivate: true, 'owner._id': id },
//             ],
//         } : { isPrivate: false }
//         query.preparationTime = { $lte: maxTime }
//         let recipes = await Recipe.find(query)
//     } catch (error) {
//         next({ status: error.status, message: error.message });
//     }
// }

export const addRecipe = async (req, res, next) => {
    try {
        const { categories, ...recipeData } = req.body;

        const recipe = new Recipe({
            ...recipeData,//אני לא רוצה לשמור פה את הקטגוריות כי נשלחות בצורה שונה מהשמירה
            owner: req.currentUser,
        })

        //צריך לעדכן גם את הקטגוריות
        //נעדכן לפני שמירה ע"מ שיחזיר לנו את הקטגוריות החדשות שנבנו בעקבות המתכון
        recipe.categories = await addRecipeToCategories(recipe, categories || [])

        const save = await recipe.save();

        res.status(201).json(save);
    } catch (error) {
        next({ status: error.status, message: error.message });
    }
}


export const updateRecipe = async (req, res, next) => {
    try {
        const { _id } = req.query;
        const { newRecipe } = req.body;
        
        if (!_id) {
            return next({ status: 400, message: '_id is required' });
        }
        
        const preRecipe = await Recipe.findById(_id);
        if (!preRecipe) {
            return next({ status: 404, message: 'Recipe not found' });
        }
        
        // Check if user is the owner
        const userId = req.currentUser?._id;
        if (!userId || preRecipe.owner._id.toString() !== userId.toString()) {
            return next({ status: 403, message: 'Access denied. You can only update your own recipes.' });
        }
        
        // Helper function to compare values (simple deep comparison for arrays/objects)
        const isEqual = (a, b) => {
            return JSON.stringify(a) === JSON.stringify(b);
        };
        
        //נעדכן את שאר הנתונים אם נשלחו לפני עדכון הקטגוריות
        for (const key in newRecipe) {
            if (key === 'categories') continue;
            if (newRecipe[key] !== undefined &&
                !isEqual(preRecipe[key], newRecipe[key])) {
                preRecipe[key] = newRecipe[key];
            }
        }
        
        //צריך לעדכן גם את הקטגוריות רק אם השתנו
        if (newRecipe.categories !== undefined &&
            !isEqual(newRecipe.categories, preRecipe.categories)) {
            //קודם נמחוק את הקטגוריות שהיו קודם
            await removeRecipeFromCategories(preRecipe)
            //נוסיף את הקטגוריות החדשות
            preRecipe.categories = await addRecipeToCategories(preRecipe, newRecipe.categories || [])
        }
        
        const save = await preRecipe.save()
        res.status(200).json(save);
    } catch (error) {
        next({ status: error.status || 500, message: error.message });
    }
}

export const deleteRecipe = async (req, res, next) => {
    try {
        const { _id } = req.query;
        if (!_id) {
            return next({ status: 400, message: "_id is required" });
        }

        const recipe = await Recipe.findById(_id);
        if (!recipe) {
            return next({ status: 404, message: "Recipe not found" });
        }
        
        // Check if user is the owner
        const userId = req.currentUser?._id;
        if (!userId || recipe.owner._id.toString() !== userId.toString()) {
            return next({ status: 403, message: 'Access denied. You can only delete your own recipes.' });
        }
        
        //צריך לעדכן גם את הקטגוריות
        await removeRecipeFromCategories(recipe);

        await Recipe.findByIdAndDelete(_id);

        res.status(200).json({ message: "Recipe deleted successfully" });
    } catch (error) {
        next({ status: error.status || 500, message: error.message });
    }
}