const mongoose = require("mongoose");

const sellNumberSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    numberId: { type: mongoose.Schema.Types.ObjectId, ref: "NightNumber", required: true },
    historyId: { type: mongoose.Schema.Types.ObjectId, ref: "History" },

    twoFiveSem: [Number],
    fiveSem: [Number],
    tenSem: [Number],

   
    totalTwoFiveSem: {type:Number},
    totalFiveSem: {type:Number},
    totalTenSem: {type:Number},

    deleteamount: { type: Number, default: 0 },

    totalNumberAmount: { type: Number, default: 0 },

    totalNumber:{type:Number},


    dateAdded: { type: String, default: "",required:true },  // 👈 REQUIRED CHANGE

    totalSell: { type: Number, default: 0 },
    soldAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SellNightModel = mongoose.model("SellNight", sellNumberSchema);
module.exports=SellNightModel;