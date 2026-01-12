import { Router } from "express";

import { blockGuest, checkAdmin, checkAuth } from '../middlewares/auth.middleware.js';

import { deleteUser, getAllUsers, signIn, signUp, updatePassword } from '../controllers/user.controller.js';

const router=Router()

router.post('/sign-in',checkAdmin,signIn)

router.post('/sign-up',signUp)

router.get('/',getAllUsers)

router.put('/',checkAuth,blockGuest,updatePassword)

router.delete('/',checkAuth,blockGuest,deleteUser)

export default router