const mongoose = require("mongoose");

const sellNumberSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    numberId: { type: mongoose.Schema.Types.ObjectId, ref: "MorningNumber", required: true },
    historyId: { type: mongoose.Schema.Types.ObjectId, ref: "History" },

    twoFiveSem: [Number],
    fiveSem: [Number],
    tenSem: [Number],


   
    totalTwoFiveSem: {type:Number},
    totalFiveSem: {type:Number},
    totalTenSem: {type:Number},

    totalNumberAmount: { type: Number, default: 0 },

    dateAdded: { type: String, default: "" ,required:true},  // 👈 REQUIRED CHANGE
    totalNumber:{type:Number},


    totalSell: { type: Number, default: 0 },
    soldAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SellMorningModel = mongoose.model("SellMorning", sellNumberSchema);
module.exports=SellMorningModel;