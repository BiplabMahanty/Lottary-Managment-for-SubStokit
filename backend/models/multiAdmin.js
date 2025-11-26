const mongoose = require("mongoose");

const multiAdminSchema = new mongoose.Schema(
  {
    ticketRate: { type: Number,},
    commissionRate: { type: Number,},
    dateAdded: { type: String, default: "",required:true,unique: true },  // 👈 REQUIRED CHANG
    sem25:{ type: String, default:""},
    sem10:{ type: String, default:""},
    sem5:{ type: String, default:""},

    sem10Num: { type: Number, },
    sem5Num: { type: Number, },
    sem25Num: { type: Number, }, 
  },
  { timestamps: true }
);

const MultiAdminModel = mongoose.model("MultiAdmin", multiAdminSchema);
module.exports=MultiAdminModel;