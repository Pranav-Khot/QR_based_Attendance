// import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//     fullName: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { type: String, default: 'user' },
//     contact: { type: String, default: '' }
// }, { timestamps: true });

// const User = mongoose.model('User', userSchema);

// // PURANA: module.exports = User; (Ise hata dein)
// export default User; // NAYA: Ye hona chahiye


import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    contact: { type: String, default: '' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// PURANA: module.exports = User; (Ise hata dein)
export default User; // NAYA: Ye hona chahiye