const NumberModel = require("../models/numberSeller");
const HistoryModel = require("../models/numberHistory");


const DeleteTicket = async (req, res) => {
  try {
    const { name, phone, start, end, category } = req.body;

    // 🔹 Validation
    if (!name || !phone || !category || start === undefined || end === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    

    // 🔹 Find seller
    const seller = await NumberModel.findOne({ name, phone });
    if (!seller) return res.status(404).json({ error: "Seller not found" });


     const startStr = start.toString();
    if (!/^\d{5}$/.test(startStr)) {
      return res
        .status(400)
        .json({ error: "Start number must be exactly 5 digits (e.g., 90100)." });
    }

    let endStr = end.toString();
    if (endStr.length < 5) {
      const prefix = startStr.slice(0, 5 - endStr.length);
      endStr = prefix + endStr;
    }

    const startNum = parseInt(startStr);
    const endNum = parseInt(endStr);

    if (endNum < startNum) {
      return res
        .status(400)
        .json({ error: "End number must be greater than or equal to start number." });
    }
    // 🔹 Normalize category input
    const categoryMap = {
      "25sem": "twoFiveSem",
      "5sem": "fiveSem",
      "10sem": "tenSem",
      "twoFiveSem": "twoFiveSem",
      "fiveSem": "fiveSem",
      "tenSem": "tenSem",
    };

    const mappedCategory = categoryMap[category];
    console.log('mapped',mappedCategory);
    if (!mappedCategory) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // 🔹 Map for deleted category
    const deleteCategoryMap = {
      twoFiveSem: "deleteTwoFiveSem",
      fiveSem: "deleteFiveSem",
      tenSem: "deleteTenSem",
    };

    const deleteKey = deleteCategoryMap[mappedCategory];

    // 🔹 Get current & deleted data safely
    let currentNumbers = seller.numbers[0] || {
      twoFiveSem: [],
      fiveSem: [],
      tenSem: [],
    };

    let currentDeleted = seller.deletedNumbers[0] || {
      deleteTwoFiveSem: [],
      deleteFiveSem: [],
      deleteTenSem: [],
    };
    

    // 🔹 Build numbers to delete
    const toDelete = [];
    for (let i = parseInt(startNum); i <= parseInt(endNum); i++) {
      toDelete.push(i.toString());
    }

    // 🔹 Check if numbers exist in that category
    const existingNumbers = (currentNumbers[mappedCategory] || []).map(String);
    const notFound = toDelete.filter((num) => !existingNumbers.includes(num));
    if (notFound.length > 0) {
      return res.status(400).json({
        error: `Some numbers do not exist in ${mappedCategory}`,
        missingNumbers: notFound,
      });
    }

    // 🔹 Perform deletion
    const deletedNumbers = [];
    currentNumbers[mappedCategory] = existingNumbers.filter((num) => {
      if (toDelete.includes(num)) {
        deletedNumbers.push(num);
        return false;
      }
      return true;
    });

    // 🔹 Push deleted numbers into deleted field
    currentDeleted[deleteKey] = [
      ...(currentDeleted[deleteKey] || []),
      ...deletedNumbers,
    ];

    // 🔹 Update seller data
  
    seller.deletedNumbers[0] = currentDeleted;
    seller.sellNumbers[0]=currentNumbers;

    seller.markModified("numbers");
    seller.markModified("deletedNumbers");

    // 🔹 Recalculate totals
    const totalNumberAmount =
      (currentNumbers.twoFiveSem.length * 25 +
        currentNumbers.fiveSem.length * 5 +
        currentNumbers.tenSem.length * 10) *
      5.56;

    seller.totalSell = totalNumberAmount;
    seller.totalBill = totalNumberAmount + seller.due;
    seller.remainingDue = seller.totalBill - seller.amountPaid;

    const lastHistory = await HistoryModel.findOne({ seller: seller._id }).sort({ date: -1 });
    

    // ✅ UPDATE LATEST HISTORY ENTRY instead of pushing a new one
    if (lastHistory) {
      

      // ✅ Initialize deletedNumbers if missing
      if (!lastHistory.deletedNumbers || lastHistory.deletedNumbers.length === 0) {
        lastHistory.deletedNumbers = [
          {
            deleteTwoFiveSem: [],
            deleteFiveSem: [],
            deleteTenSem: [],
          },
        ];
      }

      // ✅ Append deleted numbers
      lastHistory.deletedNumbers[0][deleteKey] = [
        ...(lastHistory.deletedNumbers[0][deleteKey] || []),
        ...deletedNumbers,
      ];

      // ✅ Initialize sellNumbers if missing
      if (!lastHistory.sellNumbers || lastHistory.sellNumbers.length === 0) {
        lastHistory.sellNumbers = [
          {
            sellTwoFiveSem: [],
            sellFiveSem: [],
            sellTenSem: [],
          },
        ];
      }

      // ✅ Add remaining (non-deleted) numbers to sellNumbers
      lastHistory.sellNumbers[0] = {
        sellTwoFiveSem: currentNumbers.twoFiveSem || [],
        sellFiveSem: currentNumbers.fiveSem || [],
        sellTenSem: currentNumbers.tenSem || [],
      };

      // ✅ Update totals
      lastHistory.totalSell = seller.totalSell;
      lastHistory.totalBill = seller.totalBill;
      lastHistory.vauter = seller.vauter;
      lastHistory.amountPaid = seller.amountPaid;
      lastHistory.remainingDue = seller.remainingDue;
      lastHistory.date = new Date();
    } else {
      // 🆕 If no history yet, create one
      seller.history.push({
        numbers: [{ ...currentNumbers }],
        deletedNumbers: [
          {
            deleteTwoFiveSem: currentDeleted.deleteTwoFiveSem || [],
            deleteFiveSem: currentDeleted.deleteFiveSem || [],
            deleteTenSem: currentDeleted.deleteTenSem || [],
          },
        ],
        sellNumbers: [
          {
            sellTwoFiveSem: currentNumbers.twoFiveSem || [],
            sellFiveSem: currentNumbers.fiveSem || [],
            sellTenSem: currentNumbers.tenSem || [],
          },
        ],
        totalNumberAmount: seller.totalNumberAmount,
        totalSell: seller.totalSell,
        totalBill: seller.totalBill,
        vauter: seller.vauter,
        amountPaid: seller.amountPaid,
        remainingDue: seller.remainingDue,
        returnAmount: 0,
        date: new Date(),
      });
    }
    await lastHistory.save();
    seller.sellNumbers=seller.numbers
    await seller.save();

    res.json({
      success: true,
      message: `✅ ${deletedNumbers.length} numbers deleted successfully from ${mappedCategory}`,
      deletedFrom: mappedCategory,
      deletedNumbers,
      remainingNumbers: currentNumbers[mappedCategory],
      seller,
    });
  } catch (err) {
    console.error("❌ DeleteTicket Error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports={DeleteTicket}