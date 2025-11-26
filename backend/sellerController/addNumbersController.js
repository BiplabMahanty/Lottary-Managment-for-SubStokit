const numberModel = require("../models/numberAdd/morningNumber");
const HistoryModel = require("../models/historyModel");

const addNumbers = async (req, res) => {
  try {
    const { name, phone, start, end, category } = req.body;

    // 1️⃣ Validate input
    if (!name || !phone || !category || start == null || end == null) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const startStr = start.toString();
    if (!/^\d{5}$/.test(startStr)) {
      return res.status(400).json({ error: "Start number must be 5 digits (e.g., 90100)." });
    }

    // 2️⃣ Find the seller
    const seller = await numberModel.findOne({ name, phone });
    if (!seller) {
      return res.status(404).json({ error: "Seller not found. Please add ticket first." });
    }

    // 3️⃣ Handle end number padding
    let endStr = end.toString();
    if (endStr.length < 5) {
      const prefix = startStr.slice(0, 5 - endStr.length);
      endStr = prefix + endStr;
    }

    const startNum = parseInt(startStr);
    const endNum = parseInt(endStr);
    if (endNum < startNum) {
      return res.status(400).json({ error: "End number must be >= start number." });
    }

    // 4️⃣ Generate new numbers
    const newNumbers = [];
    for (let i = startNum; i <= endNum; i++) {
      newNumbers.push(i.toString().padStart(5, "0"));
    }

    // 5️⃣ Validate category
    if (!["twoFiveSem", "fiveSem", "tenSem"].includes(category)) {
      return res.status(400).json({ error: `Invalid category: ${category}` });
    }

    // 6️⃣ Add unique numbers only
    const existingSet = new Set(seller[category].map(String));
    const uniqueNumbers = newNumbers.filter((num) => !existingSet.has(num));

    if (uniqueNumbers.length === 0) {
      return res.status(400).json({ error: "All numbers already exist in this category." });
    }

    seller[category].push(...uniqueNumbers);

    // 7️⃣ Recalculate totals
    const totalNumberAmount =
      (seller.twoFiveSem.length * 25 +
        seller.fiveSem.length * 5 +
        seller.tenSem.length * 10) *
      seller.amountPerNumber;

    seller.totalNumberAmount = totalNumberAmount;
    seller.totalSell = totalNumberAmount;
    seller.totalBill = totalNumberAmount + (seller.due || 0);
    seller.remainingDue = seller.totalBill - (seller.amountPaid || 0);

    // 8️⃣ Save history
    const newHistory = new HistoryModel({
      seller: seller._id,
      action: "AddNumbers",
      twoFiveSem: seller.twoFiveSem,
      fiveSem: seller.fiveSem,
      tenSem: seller.tenSem,
      totalNumberAmount: seller.totalNumberAmount,
      totalSell: seller.totalSell,
      totalBill: seller.totalBill,
      remainingDue: seller.remainingDue,
    });

    await newHistory.save();

    seller.history=newHistory._id
    await seller.save();

    // 9️⃣ Response
    res.json({
      success: true,
      message: `✅ Added ${uniqueNumbers.length} new numbers (${uniqueNumbers[0]}–${uniqueNumbers.at(-1)}) to ${category}.`,
      addedNumbers: uniqueNumbers,
      totals: {
        totalNumberAmount: seller.totalNumberAmount,
        totalSell: seller.totalSell,
        totalBill: seller.totalBill,
        remainingDue: seller.remainingDue,
      },
    });
  } catch (err) {
    console.error("❌ Error in addNumbers:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addNumbers };
