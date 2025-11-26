const mongoose = require("mongoose");

const deletedNumberSchema = new mongoose.Schema(
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

    dateAdded: { type: String, default: "" ,required:true},  // 👈 REQUIRED CHANGE
    totalAmount: { type: Number},
    totalNumber:{type:Number},


    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const DeletedMorningModel = mongoose.model("DeletedMorning", deletedNumberSchema);
module.exports=DeletedMorningModel;