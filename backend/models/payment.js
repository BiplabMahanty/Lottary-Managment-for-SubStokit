const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    dayNumberId: { type: mongoose.Schema.Types.ObjectId, ref: "DayNumber" },
    nightNumberId: { type: mongoose.Schema.Types.ObjectId, ref: "NightNumber" },
    morningNumberId: { type: mongoose.Schema.Types.ObjectId, ref: "MorningNumber" },
    historyId: { type: mongoose.Schema.Types.ObjectId, ref: "History" },

    // 💰 Payment info
    amountPaid: { type: Number, required: true,default:0 },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card", "Other"],
      default: "Cash",
    },

    todayBill:{type:Number,default:0},
    // optional: UPI/Bank transaction reference
    note: { type: String, trim: true },

    totalAmount:{type:Number,default:0},
    todayRemaining:{type:Number,default:0},


    vouter:{type:Number,default:0},

    // 🧾 Accounting
    previousDue: { type: Number, default: 0 },
    remainingDue: { type: Number, default: 0 },
    paymentDate: { type: Date, default: Date.now },

    dateAdded: { type: String, default: "" ,required:true},  // 👈 REQUIRED CHANGE

    // 🔒 Who recorded this payment
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true } // ✅ createdAt & updatedAt
);

const PaymentModel = mongoose.model("Payment", paymentSchema);
module.exports=PaymentModel;