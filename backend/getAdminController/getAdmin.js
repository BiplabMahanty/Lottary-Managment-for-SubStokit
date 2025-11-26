const SellerModel=require("../models/sellerModel")
const getseller = async (req, res) => {
  try {
    

    const seller = await SellerModel.find({})
      .select("_id name phone email address sellerImage dateAdded")
      .sort({ createdAt: -1 })
      .lean();

    if (!seller || seller.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No employee found",
        seller: [],
        count: 0,
      });
    }

    console.log(`Found ${seller.length} users.`);

    res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      seller,
      count: seller.length,
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

module.exports={getseller}