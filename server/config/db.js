import mongoose from "mongoose";
import User from '../models/User.model.js';
import Recipe from '../models/Recipe.model.js';
import Category from '../models/Category.model.js';

export const connectDB = async () => {
    const DB_URL = /*process.env.DB_URL || */'mongodb://127.0.0.1/Recipe';
    try {
        await mongoose.connect(DB_URL)
        console.log(`✅ Mongo Connect to ${DB_URL}`);
    } catch (error) {
        console.log('⚠️  Mongo Error:', error.message);
        console.log(`⚠️  Trying to connect to: ${DB_URL}`);
        console.log('⚠️  Server will continue without database connection');
        console.log('⚠️  Make sure MongoDB is running if you need database features');
        // Don't exit - allow server to run for testing without DB
        // process.exit();
    }
}