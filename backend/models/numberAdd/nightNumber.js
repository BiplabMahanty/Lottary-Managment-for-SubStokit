const mongoose = require("mongoose");
const DeletedNumberModel = require("../deleteNumber/deleteNight");

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

    // 💰 Financial details
    amountPerNumber: { type: Number, default: 5.56 },
    due: { type: Number, default: 0 },
    totalNumberAmount: { type: Number, default: 0 },
    totalBill: { type: Number, default: 0 },
    deletedNightId: { type: mongoose.Schema.Types.ObjectId, ref: "DeletedNight" } ,

    dateAdded: { type: String, default: "" ,required:true},  // 👈 REQUIRED CHANGE

    totalNumber:{type:Number},

    sellNightId:{ type: mongoose.Schema.Types.ObjectId, ref: "SellNight" } ,

    // 📜 History reference
    history: { type: mongoose.Schema.Types.ObjectId, ref: "History" },
  },
  { timestamps: true } // ✅ createdAt & updatedAt automatically added
);

const NightNumberModel = mongoose.model("NightNumber", numberSchema);
module.exports=NightNumberModel;