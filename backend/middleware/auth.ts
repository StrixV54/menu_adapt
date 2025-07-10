import { NextFunction, Request, Response } from "express";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    // Check if the user is authenticated
    console.log(" middleware ", req.headers?.token);
    if (req.headers?.token) {
        return next();
    }
    // If not authenticated, redirect to login page
    //   res.redirect('/login');
    
}

export default authMiddleware;
