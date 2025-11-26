const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    numberId: { type: mongoose.Schema.Types.ObjectId, ref: "Number", required: true },
   
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    totalNumberAmount: { type: Number, default: 0 },
    totalSell: { type: Number, default: 0 },
    totalBill: { type: Number, default: 0 },
    vauter: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    totalAmountPaid: { type: Number, default: 0 },
    remainingDue: { type: Number, default: 0 },
    returnAmount: { type: Number, default: 0 },
    dateAdded: { type: String, default: "" },  // 👈 REQUIRED CHANGE
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const HistoryModel = mongoose.model("History", historySchema);
module.exports=HistoryModel;