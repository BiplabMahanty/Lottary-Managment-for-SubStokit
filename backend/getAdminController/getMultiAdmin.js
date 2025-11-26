const MultiAdminModel=require("../models/multiAdmin")
const getMultiAdmin = async (req, res) => {
  try {
    

    const multiAdmin = await MultiAdminModel.find({})
      .select("_id ticketRate commissionRate sem25 sem10 sem5 sem10Num sem5Num sem25Num dateAdded")
      .sort({ createdAt: -1 })
      .lean();

    if (!multiAdmin || multiAdmin.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No employee found",
        multiAdmin: [],
        count: 0,
      });
    }

    console.log(`Found ${multiAdmin.length} users.`);

    res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      multiAdmin,
      count: multiAdmin.length,
    });
  } catch (error) {
    console.error("❌ Error fetching multiAdmin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch multiAdmin",
      error: error.message,
    });
  }
};

module.exports={getMultiAdmin}