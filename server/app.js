import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { config } from 'dotenv';
import { connectDB } from './config/db.js';

import { notFound,errorHandler } from './middlewares/errorHandling.moddleware.js';

import CategoryRouter from './routes/category.routes.js'
import UserRouter from './routes/user.routes.js'
import RecipeRouter from './routes/recipe.routes.js'

const result = config();
console.log('dotenv load result', result);

connectDB()


//עליו מעמיסים את כל הניתובים
const app=express();

//json ע"מ שהשרת יוכל לקרוא נתונים שנשלחו בצורת קובץ 
app.use(express.json());

//body-ע"מ שהשרת יוכל לקרוא נתונים שנשלחו בצורת טופס
app.use(express.urlencoded({ extended: true }));

//אחרי כל בקשה השרת מדפיס את הנתונים
app.use(morgan('dev'));

app.use(cors())

//middlewares before request


app.get('/',(req, res) => {
    res.json('HELLO TO YOU');
    console.log('HELLO TO YOU');   
})

app.use('/category',CategoryRouter)

app.use('/user',UserRouter)

app.use('/recipe',RecipeRouter)

//middlewares after request

app.use(notFound); // כל בקשה לא מזוהה

app.use(errorHandler); //next(err) מטפל בכל שגיאה שהועברה עם 

export default app;