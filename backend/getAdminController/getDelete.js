const DeletedNightModel = require("../models/deleteNumber/deleteNight");
const DeletedMorningModel = require("../models/deleteNumber/deleteMorning");
const DeletedDayModel = require("../models/deleteNumber/deleteDay");
const getDelete = async (req, res) => {
  try {
    
    const {sellerId,dateAdded}=req.body;

    const deleteNight = await DeletedNightModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("sellerId numberId historyId twoFiveSem fiveSem tenSem totalAmount dateAdded totalTwoFiveSem totalFiveSem totalTenSem totalNumber")
      

   if (deleteNight) {
      console.log("deleteNight", deleteNight.totalTwoFiveSem);
      console.log("deleteNight", deleteNight.totalFiveSem);
      console.log("deleteNight", deleteNight.totalTenSem);
    } else {
      console.log("deleteNight: No record found");
    }

    const deleteDay = await DeletedDayModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("sellerId numberId historyId twoFiveSem fiveSem tenSem totalAmount dateAdded totalTwoFiveSem totalFiveSem totalTenSem totalNumber")
      

  if (deleteDay) {
      console.log("deleteDay", deleteDay.totalTwoFiveSem);
      console.log("deleteDay", deleteDay.totalFiveSem);
      console.log("deleteDay", deleteDay.totalTenSem);
    } else {
      console.log("deleteDay: No record found");
    }
    const deleteMorning = await DeletedMorningModel.findOne({sellerId:sellerId,dateAdded:dateAdded})
      .populate("sellerId numberId historyId twoFiveSem fiveSem tenSem totalAmount dateAdded totalTwoFiveSem totalFiveSem totalTenSem totalNumber")
      
   if (deleteMorning) {
      console.log("deleteMorning", deleteMorning.totalTwoFiveSem);
      console.log("deleteMorning", deleteMorning.totalFiveSem);
      console.log("deleteMorning", deleteMorning.totalTenSem);
    } else {
      console.log("deleteMorning: No record found");
    }



    res.status(200).json({
      success: true,
      message: "employee fetched successfully",
      deleteNight,
      deleteDay,
      deleteMorning,
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

module.exports={getDelete}