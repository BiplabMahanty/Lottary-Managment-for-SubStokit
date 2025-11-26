const MultiAdminModel=require("../models/multiAdmin");

const updateAmount= async (req, res)=>{  
  try {
    const { ticketRate,sem10Num,sem25Num,sem5Num } = req.body;    
    const today = new Date().toISOString().split("T")[0];

    let multiAdminDoc = await MultiAdminModel.findOne();    
    if (!multiAdminDoc) {
        multiAdminDoc = new MultiAdminModel({
            ticketRate,
            sem10Num,
            sem5Num,
            sem25Num, 
            

            dateAdded: today
        });
    }
    else {
          multiAdminDoc.sem10Num=sem10Num;
          multiAdminDoc.sem5Num=sem5Num;
          multiAdminDoc.sem25Num=sem25Num;
        
        multiAdminDoc.ticketRate = ticketRate;
         multiAdminDoc.dateAdded= today
       
    }
    await multiAdminDoc.save();
    res.status(200).json({ message: "Rates updated successfully.", data: multiAdminDoc });
    } catch (error) {

    console.error("Error updating rates:", error);
    res.status(500).json({ error: "Internal server error." });
  } 
}
module.exports = updateAmount;

    