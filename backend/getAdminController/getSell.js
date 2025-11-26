const SellNightModel = require("../models/sellNumber/sellNight");
const SellMorningModel = require("../models/sellNumber/sellMorning");
const SellDayModel = require("../models/sellNumber/sellDay");
const getSell = async (req, res) => {
  try {
    
    const {sellerId,dateAdded}=req.body;

    const sellNight = await SellNightModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("sellerId numberId historyId twoFiveSem fiveSem tenSem totalNumberAmount dateAdded totalTwoFiveSem totalFiveSem totalTenSem totalNumber")
      

   if (sellNight) {
      console.log("sellNight", sellNight.totalTwoFiveSem);
      console.log("sellNight", sellNight.totalFiveSem);
      console.log("sellNight", sellNight.totalTenSem);
    } else {
      console.log("sellNight: No record found");
    }

    const sellDay = await SellDayModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("sellerId numberId historyId twoFiveSem fiveSem tenSem totalNumberAmount dateAdded totalTwoFiveSem totalFiveSem totalTenSem totalNumber")
      

  if (sellDay) {
      console.log("sellDay", sellDay.totalTwoFiveSem);
      console.log("sellDay", sellDay.totalFiveSem);
      console.log("sellDay", sellDay.totalTenSem);
    } else {
      console.log("sellDay: No record found");
    }
    const sellMorning = await SellMorningModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("sellerId numberId historyId twoFiveSem fiveSem tenSem totalNumberAmount dateAdded totalTwoFiveSem totalFiveSem totalTenSem totalNumber")
    
   
   if (sellMorning) {
      console.log("sellMorning", sellMorning.totalTwoFiveSem);
      console.log("sellMorning", sellMorning.totalFiveSem);
      console.log("sellMorning", sellMorning.totalTenSem);
    } else {
      console.log("sellMorning: No record found");
    }



    res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      sellNight,
      sellDay,
      sellMorning,
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

module.exports={getSell}