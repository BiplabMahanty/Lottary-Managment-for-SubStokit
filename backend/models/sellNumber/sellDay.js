const mongoose = require("mongoose");

const sellNumberSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    numberId: { type: mongoose.Schema.Types.ObjectId, ref: "DayNumber", required: true },
    historyId: { type: mongoose.Schema.Types.ObjectId, ref: "History" },

    twoFiveSem: [Number],
    fiveSem: [Number],
    tenSem: [Number],

   
    totalTwoFiveSem: {type:Number},
    totalFiveSem: {type:Number},
    totalTenSem: {type:Number},

    totalNumberAmount: { type: Number, default: 0 },
    totalNumber:{type:Number},


    dateAdded: { type: String, default: "" ,required:true,},  // 👈 REQUIRED CHANGE

    totalSell: { type: Number, default: 0 },
    soldAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SellDayModel = mongoose.model("SellDay", sellNumberSchema);
module.exports=SellDayModel;