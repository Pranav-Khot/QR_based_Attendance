


// import mongoose from "mongoose";

// const registerSchema = new mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       required: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       validate: {
//         validator: function (v) {
//           // only @gmail.com emails allowed
//           return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(v);
//         },
//         message: (props) => `${props.value} is not a valid Gmail address!`,
//       },
//     },

//     password: {
//       type: String,
//       required: true,
//     },

//     contact: {
//       type: String,
//       required: true,
//     },

//     role: {
//       type: String,
//       enum: ["admin", "teacher", "user"],
//       default: "user",
//     },

//     // ✅ Approval system fields (added)
//     approved: { type: Boolean, default: false },
//     approvalStatus: {
//       type: String,
//       enum: ["PENDING", "APPROVED", "REJECTED"],
//       default: "PENDING",
//     },
//     approvedAt: { type: Date, default: null },
//   },
//   { timestamps: true }
// );

// const Register = mongoose.model("Register", registerSchema);
// export default Register;


import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(v);
        },
        message: (props) => `${props.value} is not a valid Gmail address!`,
      },
    },

    password: {
      type: String,
      required: true,
    },

    contact: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "user"],
      default: "user",
    },

    // ✅ Domain assigned by teacher (MEAN Stack, Java Full Stack, etc.)
    domain: {
      type: String,
      enum: ["MEAN Stack", "Java Full Stack", "Python Developer", "Cyber Security", null],
      default: null,
    },

    // Approval system fields
    approved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Register = mongoose.model("Register", registerSchema);
export default Register;