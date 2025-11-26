const mongoose = require("mongoose");

const numberSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" ,required: true},
    name: { type: String, required: true },
    phone: { type: String, required: true },
    dateAdded: { type: String, default: "" },  // 👈 REQUIRED CHANGE    

    // 🎯 Active numbers
    twoFiveSem: [Number],
    fiveSem: [Number],
    tenSem: [Number],

   
    totalTwoFiveSem: {type:Number},
    totalFiveSem: {type:Number},
    totalTenSem: {type:Number},
    dateAdded: { type: String, default: "" ,required:true},  // 👈 REQUIRED CHANGE
    // 💰 Financial details
    amountPerNumber: { type: Number, default: 5.56 },
    due: { type: Number, default: 0 },
    totalNumberAmount: { type: Number, default: 0 },
    totalBill: { type: Number, default: 0 },
    totalNumber:{type:Number},

    // 📜 History reference
    history: { type: mongoose.Schema.Types.ObjectId, ref: "History" },
  },
  { timestamps: true } // ✅ createdAt & updatedAt automatically added
);

const MorningNumberModel = mongoose.model("MorningNumber", numberSchema);
module.exports=MorningNumberModel;