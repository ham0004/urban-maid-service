const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['customer', 'maid', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpire: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Maid Profile Fields
    maidProfile: {
      experience: {
        type: Number,
        default: 0,
      },
      skills: [
        {
          type: String,
          trim: true,
        },
      ],
      documents: [
        {
          docType: {
            type: String, // e.g., 'NID', 'Passport'
            enum: ['NID', 'Passport', 'Other'],
          },
          url: {
            type: String,
          },
          status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
          },
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      verificationStatus: {
        type: String,
        enum: ['unverified', 'pending', 'approved', 'rejected'],
        default: 'unverified',
      },
      // Scheduling Fields (Member-3, Module 2)
      weeklySchedule: [
        {
          dayOfWeek: {
            type: Number,
            required: true,
            min: 0,
            max: 6, // 0 = Monday, 6 = Sunday
          },
          isAvailable: {
            type: Boolean,
            default: false,
          },
          startTime: {
            type: String, // Format: "HH:MM" (24-hour)
            default: '09:00',
          },
          endTime: {
            type: String, // Format: "HH:MM" (24-hour)
            default: '18:00',
          },
        },
      ],
      blockedSlots: [
        {
          date: {
            type: Date,
            required: true,
          },
          reason: {
            type: String,
            trim: true,
            maxlength: [200, 'Reason cannot exceed 200 characters'],
          },
          startTime: {
            type: String, // Format: "HH:MM" for partial day blocks
            default: '00:00',
          },
          endTime: {
            type: String, // Format: "HH:MM"
            default: '23:59',
          },
        },
      ],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user data without sensitive info
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.verificationTokenExpire;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

module.exports = mongoose.model('User', userSchema);