const NightNumberModel = require("../models/numberAdd/nightNumber");
const MorningNumberModel = require("../models/numberAdd/morningNumber");
const DayNumberModel = require("../models/numberAdd/dayNumber");
const getNumber = async (req, res) => {
  try {
    
    const {sellerId,dateAdded}=req.body;

    const nightNumber = await NightNumberModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("_id twoFiveSem fiveSem tenSem totalNumberAmount dateAdded totalBill totalTwoFiveSem totalFiveSem totalTenSem totalNumber")
      

   if (nightNumber) {
      console.log("nightNumber", nightNumber.totalTwoFiveSem);
      console.log("nightNumber", nightNumber.totalFiveSem);
      console.log("nightNumber", nightNumber.totalTenSem);
    } else {
      console.log("nightNumber: No record found");
    }

    const dayNumber = await DayNumberModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("_id twoFiveSem fiveSem tenSem totalNumberAmount dateAdded totalBill totalTwoFiveSem totalFiveSem totalTenSem totalNumber")
      

  if (dayNumber) {
      console.log("dayNumber", dayNumber.totalTwoFiveSem);
      console.log("dayNumber", dayNumber.totalFiveSem);
      console.log("dayNumber", dayNumber.totalTenSem);
    } else {
      console.log("dayNumber: No record found");
    }
    const MorningNumber = await MorningNumberModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("_id twoFiveSem fiveSem tenSem totalNumberAmount dateAdded totalBill totalTwoFiveSem totalFiveSem totalTenSem totalNumber")
    
   
   if (MorningNumber) {
      console.log("MorningNumber", MorningNumber.totalTwoFiveSem);
      console.log("MorningNumber", MorningNumber.totalFiveSem);
      console.log("MorningNumber", MorningNumber.totalTenSem);
    } else {
      console.log("MorningNumber: No record found");
    }



    res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      nightNumber,
      dayNumber,
      MorningNumber,
      
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

module.exports={getNumber}