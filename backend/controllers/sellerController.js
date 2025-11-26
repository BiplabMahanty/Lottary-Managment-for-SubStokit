const NumberModel = require("../models/numberAdd/morningNumber");

// ✅ Add seller or add numbers to selected category
const AddTicket = async (req, res) => {
  try {
    const { name, phone, start, end, category, due, newHistory } = req.body;

    if (!name || !phone || !category || start === undefined || end === undefined)
      return res.status(400).json({ error: "All fields are required" });

    const numbersArray = [];
    for (let i = parseInt(start); i <= parseInt(end); i++) {
      numbersArray.push(i);
    }

    let seller = await NumberModel.findOne({ name, phone });

    // If seller does not exist, create new
    seller.numbers=[0];

    if (!seller) {
      const newNumbers = {
        twoFiveSem: category === "twoFiveSem" ? numbersArray : [],
        fiveSem: category === "fiveSem" ? numbersArray : [],
        tenSem: category === "tenSem" ? numbersArray : [],
      };

      const totalNumberAmount =
        (newNumbers.twoFiveSem.length * 25 +
          newNumbers.fiveSem.length * 5 +
          newNumbers.tenSem.length * 10) *
        5.56;


      seller = new NumberModel({
        name,
        phone,
        numbers: [newNumbers],
        due: due || 0,
        amountPerNumber: 5.56,
        totalNumberAmount,
        totalSell: totalNumberAmount,
        totalBill: totalNumberAmount + (due || 0),
        remainingDue: totalNumberAmount + (due || 0),
        history: [],
      });

      // ✅ Create first history entry for new seller
      seller.history.push({
        action: "AddTicket",
        numbers: [{ ...newNumbers }],
        totalNumberAmount: seller.totalNumberAmount,
        totalSell: seller.totalSell,
        totalBill: seller.totalBill,
        remainingDue: seller.remainingDue,
        date: new Date(),
      });
    } else {
      // Existing seller — push into their numbers array
      let currentNumbers = seller.numbers[0] || {
        twoFiveSem: [],
        fiveSem: [],
        tenSem: [],
      };

      currentNumbers[category].push(...numbersArray);

      seller.numbers[0] = currentNumbers;

      const totalNumberAmount =
        (currentNumbers.twoFiveSem.length * 25 +
          currentNumbers.fiveSem.length * 5 +
          currentNumbers.tenSem.length * 10) *
        5.56;

      seller.totalNumberAmount = totalNumberAmount;
      seller.totalSell = totalNumberAmount;
      seller.totalBill = totalNumberAmount + seller.due;
      seller.remainingDue = seller.totalBill - seller.amountPaid;

      // ✅ Handle history based on newHistory flag
      if (newHistory || seller.history.length === 0) {
        // Create a NEW history entry
        seller.history.push({
          action: "AddTicket",
          numbers: [{ ...currentNumbers }],
          totalNumberAmount: seller.totalNumberAmount,
          totalSell: seller.totalSell,
          totalBill: seller.totalBill,
          remainingDue: seller.remainingDue,
          date: new Date(),
        });
      } else {
        // Update the LAST history entry
        const lastHistory = seller.history[seller.history.length - 1];
        lastHistory.action = "AddTicket";
        lastHistory.numbers = [{ ...currentNumbers }];
        lastHistory.totalNumberAmount = seller.totalNumberAmount;
        lastHistory.totalSell = seller.totalSell;
        lastHistory.totalBill = seller.totalBill;
        lastHistory.remainingDue = seller.remainingDue;
        lastHistory.date = new Date();
      }
    }

    await seller.save();
    res.json({ success: true, message: "Numbers added successfully", seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//// ✅ Delete numbers and update/create history based on newHistory flag


// ✅ Payment updates based on newHistory flag

// ✅ Get all sellers
const getSaller = async (req, res) => {
  try {
    const sellers = await NumberModel.find();
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  AddTicket,
  getSaller,
};