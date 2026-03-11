// Load environment variables
require('dotenv').config();

// Core modules
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const os = require("os");

// Custom modules
const connectDB = require("./config/dbConnection");
require("./config/passport")(passport);

// Routes
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const donorRoutes = require("./routes/donor");
const agentRoutes = require("./routes/agent");

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// View engine setup
app.set("view engine", "ejs");
app.use(expressLayouts);

// Static files
app.use("/assets", express.static(__dirname + "/assets"));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method Override
app.use(methodOverride("_method"));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash middleware
app.use(flash());

// Global variables (Flash and User Info)
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.warning = req.flash("warning");
    next();
});

// Routes
app.use(homeRoutes);
app.use(authRoutes);
app.use(donorRoutes);
app.use(adminRoutes);
app.use(agentRoutes);

// 404 Page
app.use((req, res) => {
    res.status(404).render("404page", { title: "Page not found" });
});

// Logout Route
app.get('/auth/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success', 'You have logged out successfully.');
        res.redirect('/');
    });
});

// Helper: Get local network IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`Server running locally at http://localhost:${PORT}`);
    console.log(`Accessible on network at http://${localIP}:${PORT}`);
});
