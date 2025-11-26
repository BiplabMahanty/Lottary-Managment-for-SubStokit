const PaymentModel =require("../models/payment")

const getPayment = async (req, res) => {
  try {
    
    const {sellerId,dateAdded}=req.body;

    const Payment = await PaymentModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("sellerId sellerId amountPaid paymentMethod todayBill vouter remainingDue totalAmount todayRemaining note dateAdded")
      

   
    res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
     Payment
    });
  } catch (error) {
    console.error("❌ Error fetching seller:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller",
      error: error.message,
    });
  }
};

module.exports={getPayment}