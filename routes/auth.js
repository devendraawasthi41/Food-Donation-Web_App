const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/user.js");
const middleware = require("../middleware/index.js");

// ================= SIGNUP ROUTES ===================

router.get("/auth/signup", middleware.ensureNotLoggedIn, (req, res) => {
    res.render("auth/signup", { title: "User Signup" });
});

router.post("/auth/signup", middleware.ensureNotLoggedIn, async (req, res) => {
    const { firstName, lastName, email, password1, password2, role } = req.body;
    let errors = [];

    if (!firstName || !lastName || !email || !password1 || !password2) {
        errors.push({ msg: "Please fill in all the fields" });
    }
    if (password1 !== password2) {
        errors.push({ msg: "Passwords are not matching" });
    }
    if (password1.length < 4) {
        errors.push({ msg: "Password length should be at least 4 characters" });
    }

    if (errors.length > 0) {
        return res.render("auth/signup", {
            title: "User Signup",
            errors,
            firstName,
            lastName,
            email,
            password1,
            password2
        });
    }

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            errors.push({ msg: "This Email is already registered. Please try another email." });
            return res.render("auth/signup", {
                title: "User Signup",
                firstName,
                lastName,
                email,
                password1,
                password2,
                errors
            });
        }

        const newUser = new User({ firstName, lastName, email, password: password1, role });
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password1, salt);

        await newUser.save();

        req.flash("success", "You are successfully registered and can log in.");
        res.redirect("/auth/login");

    } catch (err) {
        console.error(err);
        req.flash("error", "Some error occurred on the server.");
        res.redirect("back");
    }
});

// ================= LOGIN ROUTES ===================

router.get("/auth/login", middleware.ensureNotLoggedIn, (req, res) => {
    res.render("auth/login", { title: "User Login" });
});

router.post("/auth/login", middleware.ensureNotLoggedIn,
    passport.authenticate('local', {
        failureRedirect: "/auth/login",
        failureFlash: true,
    }),
    (req, res) => {
        const redirectUrl = req.session.returnTo || `/${req.user.role}/dashboard`;
        delete req.session.returnTo; // Clear karna jaruri hai
        req.flash("success", "Welcome back!");
        res.redirect(redirectUrl);
    }
);

// ================= LOGOUT ROUTES ===================

router.get("/auth/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            console.error('Logout Error:', err);
            return next(err); 
        }
        req.flash("success", "Logged out successfully.");
        res.redirect("/");
    });
});

module.exports = router;

