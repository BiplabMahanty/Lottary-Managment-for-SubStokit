const NumberModel = require("../models/numberAdd/morningNumber");
const HistoryModel = require("../models/historyModel");

/**
 * @route POST /api/numbers/add
 * @desc Add a new seller ticket or update existing seller
 */
const addTicket = async (req, res) => {
  try {
    const { name, phone, due } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required." });
    }

    // Check for existing seller
    let seller = await NumberModel.findOne({ name, phone });

    if (seller) {
      // ✅ Existing seller: add new history entry
      const history = new HistoryModel({
        name:name,
        phone:phone,
        numberId: seller._id,
        
        totalNumberAmount: 0,
        totalSell: 0,
        totalBill: due || 0,
        remainingDue: due || 0,
        date: new Date(),
      });

      await history.save();

      seller.history=history._id;
      seller.due = (seller.due || 0) + (due || 0);
      await seller.save();

      return res.json({
        success: true,
        message: "Existing seller updated with new history.",
        seller,
        history,
      });
    }

    // ✅ New seller
    const newSeller = new NumberModel({
      name,
      phone,
      twoFiveSem: [],
      fiveSem: [],
      tenSem: [],
      due: due || 0,
      amountPerNumber: 5.56,
      totalNumberAmount: 0,
      
      totalBill: due || 0,
     
    });
    console.log("test")

    await newSeller.save();

    // Create first history entry
    const history = new HistoryModel({
      name,
      phone,
      numberId: newSeller._id,
      sellerId: newSeller.sellerId ,
      totalNumberAmount: 0,
      totalSell: 0,
      totalBill: due || 0,
      remainingDue: due || 0,
      date: new Date(),
    });

    await history.save();
    newSeller.sellerId=history.sellerId,
    newSeller.history=history._id;
    await newSeller.save();

    return res.json({
      success: true,
      message: "New seller ticket created successfully.",
      seller: newSeller,
      history,
    });
  } catch (err) {
    console.error("❌ addTicket error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addTicket };
