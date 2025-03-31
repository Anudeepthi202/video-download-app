const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    isPremium: { type: Boolean, default: false }, // Premium status
    downloads: [
        {
            date: { type: Date, default: Date.now },
            count: { type: Number, default: 1 }
        }
    ]
});

module.exports = mongoose.model("User", UserSchema);
