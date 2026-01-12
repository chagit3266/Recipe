import bcrypt from "bcryptjs";
import { JoiUserSchema,generateToken } from '../models/User.model.js'
import User from '../models/User.model.js'


export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        next({ status: error.status, message: error.message });
    }
}

export const updatePassword = async (req, res, next) => {
    try {
        const { error, value } = JoiUserSchema.update.validate(req.body);
        if (error)
            return next({ status: 400, message: error.details[0].message });

        const { _id } = req.currentUser

        if (!value.password) {
            return next({ status: 400, message: "Password is required" });
        }

        const user = await User.findById(_id);

        user.password = value.password;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        next({ status: error.status, message: error.message });
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        const { _id } = req.currentUser

        const user = await User.findById(_id);

        await user.deleteOne();

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        next({ status: error.status, message: error.message });
    }
}

export const signUp = async (req, res, next) => {
    try {
        const { error, value } = JoiUserSchema.signUp.validate(req.body);
        if (error)
            return next({ status: 400, message: error.details[0].message });

        const existing = await User.findOne({ email: value.email });
        if (existing)
            return next({ status: 409, message: 'Email already registered' });
        value.role = 'user'
        if (req.isAdmin) {
            value.role = 'admin';
        }
        const user = new User(value)
        const token = generateToken(user);
        await user.save()
        res.status(201).json({ userName: user.name, token })
    } catch (error) {
        next({ status: error.status, message: error.message });
    }
}

export const signIn = async (req, res, next) => {
    try {
        const { error, value } = JoiUserSchema.signIn.validate(req.body);
        if (error)
            return next({ status: 400, message: error.details[0].message });

        const user = await User.findOne({ email: value.email });
        if (!user)
            return next({ status: 401, message: 'Invalid email' });
        //בדיקת סיסמה
        const isMatch = await bcrypt.compare(value.password, user.password);
        if (!isMatch)
            return next({ status: 401, message: 'Invalid password' });

        const token = generateToken(user);
        res.status(200).json({ userName: user.name, token })
    } catch (error) {
        next({ status: error.status, message: error.message });
    }
}