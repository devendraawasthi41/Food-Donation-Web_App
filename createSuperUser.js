const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // सही path से import करो

// 1. MongoDB से connect हो
mongoose.connect('mongodb://127.0.0.1:27017/food-donation', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {
    console.log('✅ MongoDB Connected');

    // 2. Check करो कि Superuser already exist तो नहीं
    const superuserExists = await User.findOne({ email: "superadmin@example.com" });

    if (superuserExists) {
        console.log('⚡ Superuser already exists!');
        mongoose.disconnect();
        return;
    }

    // 3. Password को encrypt करो
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 4. नया SuperAdmin create करो
    const superuser = new User({
        firstName: "Super",
        lastName: "Admin",
        email: "superadmin@example.com",
        password: hashedPassword,
        gender: "male", // Optional
        address: "Admin Office",
        phone: 9876543210,
        role: "admin" // Must be 'admin'
    });

    await superuser.save();
    console.log('🎉 Superuser created successfully!');

    mongoose.disconnect();
})
.catch(err => console.log('❌ Error:', err));
