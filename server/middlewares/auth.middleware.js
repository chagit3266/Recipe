import jwt from 'jsonwebtoken';

export const checkAuth = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (authorization?.startsWith('Bearer ')) {
            const [, token] = authorization.split(' ');
            const secret = process.env.JWT_SECRET || "JWT_SECRET";
            const verified = jwt.verify(token, secret);//חילוץ מהטוקן
            req.currentUser = verified;
        }
        next()
    } catch (error) {
        next({ status: 401, message: 'Invalid token.' })
    }
}

export const blockGuest = (req, res, next) => {
    if (!req.currentUser) {
        return next({ status: 401, message: 'Access denied. Please login.' });
    }
    next();
};

export const checkAdmin = (req, res, next) => {
    req.isAdmin=true
    next()
}