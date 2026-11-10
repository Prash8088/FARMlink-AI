const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerDetailsSchema = new mongoose.Schema(
  {
    farmName: { type: String, default: '', trim: true },
    farmLocation: { type: String, default: '', trim: true },
    farmingExperience: { type: Number, default: 0, min: 0 },
    mainCropsGrown: { type: [String], default: [] }
  },
  { _id: false }
);

const buyerDetailsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: '', trim: true },
    businessType: { type: String, default: '', trim: true },
    businessLocation: { type: String, default: '', trim: true },
    requiredCategories: { type: [String], default: [] }
  },
  { _id: false }
);

const transporterDetailsSchema = new mongoose.Schema(
  {
    companyOrIndividualName: { type: String, default: '', trim: true },
    vehicleType: { type: String, default: '', trim: true },
    vehicleRegNumber: { type: String, default: '', trim: true },
    vehicleCapacity: { type: String, default: '', trim: true },
    operatingLocations: { type: [String], default: [] }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[0-9+-\s()]{7,20}$/, 'Please enter a valid phone number']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ['farmer', 'buyer', 'transporter', 'admin'],
        message: '{VALUE} is not a valid user role'
      },
      default: 'farmer',
      required: true,
      index: true
    },
    profileImage: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    village: {
      type: String,
      required: [true, 'Village or city is required'],
      trim: true
    },
    farmerDetails: {
      type: farmerDetailsSchema,
      default: () => ({})
    },
    buyerDetails: {
      type: buyerDetailsSchema,
      default: () => ({})
    },
    transporterDetails: {
      type: transporterDetailsSchema,
      default: () => ({})
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Transform to strip sensitive fields on JSON serialization
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
