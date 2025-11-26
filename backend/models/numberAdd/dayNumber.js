const mongoose = require("mongoose");

const numberSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" ,required: true },
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

    // 💰 Financial details
    amountPerNumber: { type: Number, default: 6.56 },
    due: { type: Number, default: 0 },
    totalNumberAmount: { type: Number, default: 0 },
    totalBill: { type: Number, default: 0 },
    dateAdded: { type: String, default: "" ,required:true},  // 👈 REQUIRED CHANGE
    totalNumber:{type:Number},
    deletedDayId: { type: mongoose.Schema.Types.ObjectId, ref: "DeletedDay" } ,

    sellDayId:{type: mongoose.Schema.Types.ObjectId, ref: "SellDay"},

    // 📜 History reference
    history: { type: mongoose.Schema.Types.ObjectId, ref: "History" },
  },
  { timestamps: true } // ✅ createdAt & updatedAt automatically added
);

const DayNumberModel = mongoose.model("DayNumber", numberSchema);
module.exports=DayNumberModel;