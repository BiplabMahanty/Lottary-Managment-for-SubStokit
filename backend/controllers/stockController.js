// backend/controllers/stokitController.js
const NumberModel = require("../models/numberAdd/morningNumber");
const StokitModel = require("../models/stokitModel");

// ✅ Create stokit by date (aggregate all sellers’ history for that date)
const createStokitByDate = async (req, res) => {
  try {
    const { stokitName, date } = req.body;
    if (!stokitName || !date) {
      return res.status(400).json({ error: "Stokit name and date are required" });
    }

    const selectedDate = new Date(date);
    const sellers = await NumberModel.find();

    // initialize empty aggregate containers
    const stokitNumbers = {
      twoFiveSem: [],
      fiveSem: [],
      tenSem: [],
    };
    const deletedNumbers = {
      deleteTwoFiveSem: [],
      deleteFiveSem: [],
      deleteTenSem: [],
    };
    const sellNumbers = {
      sellTwoFiveSem: [],
      sellFiveSem: [],
      sellTenSem: [],
    };
    const fromSellers = [];

    // loop through sellers
    sellers.forEach((seller) => {
      // find history entries for the given date
      const historyForDate = seller.history.filter((h) => {
        const hDate = new Date(h.date);
        return (
          hDate.getFullYear() === selectedDate.getFullYear() &&
          hDate.getMonth() === selectedDate.getMonth() &&
          hDate.getDate() === selectedDate.getDate()
        );
      });

      if (historyForDate.length > 0) {
        historyForDate.forEach((h) => {
          // numbers
          if (h.numbers?.[0]) {
            stokitNumbers.twoFiveSem.push(...(h.numbers[0].twoFiveSem || []));
            stokitNumbers.fiveSem.push(...(h.numbers[0].fiveSem || []));
            stokitNumbers.tenSem.push(...(h.numbers[0].tenSem || []));
          }

          // deleted
          if (h.deletedNumbers?.[0]) {
            deletedNumbers.deleteTwoFiveSem.push(
              ...(h.deletedNumbers[0].deleteTwoFiveSem || [])
            );
            deletedNumbers.deleteFiveSem.push(
              ...(h.deletedNumbers[0].deleteFiveSem || [])
            );
            deletedNumbers.deleteTenSem.push(
              ...(h.deletedNumbers[0].deleteTenSem || [])
            );
          }

          // sold
          if (h.sellNumbers?.[0]) {
            sellNumbers.sellTwoFiveSem.push(...(h.sellNumbers[0].sellTwoFiveSem || []));
            sellNumbers.sellFiveSem.push(...(h.sellNumbers[0].sellFiveSem || []));
            sellNumbers.sellTenSem.push(...(h.sellNumbers[0].sellTenSem || []));
          }
        });

        // summary from seller
        fromSellers.push({
          sellerName: seller.name,
          sellerPhone: seller.phone,
          numbersCount:
            (historyForDate[0].numbers?.[0]?.twoFiveSem?.length || 0) +
            (historyForDate[0].numbers?.[0]?.fiveSem?.length || 0) +
            (historyForDate[0].numbers?.[0]?.tenSem?.length || 0),
          sellCount:
            (historyForDate[0].sellNumbers?.[0]?.sellTwoFiveSem?.length || 0) +
            (historyForDate[0].sellNumbers?.[0]?.sellFiveSem?.length || 0) +
            (historyForDate[0].sellNumbers?.[0]?.sellTenSem?.length || 0),
          deletedCount:
            (historyForDate[0].deletedNumbers?.[0]?.deleteTwoFiveSem?.length || 0) +
            (historyForDate[0].deletedNumbers?.[0]?.deleteFiveSem?.length || 0) +
            (historyForDate[0].deletedNumbers?.[0]?.deleteTenSem?.length || 0),
        });
      }
    });

    // save stokit entry
    const stokit = new StokitModel({
      stokitName,
      stokitNumbers: [stokitNumbers],
      numbers: [stokitNumbers],
      deletedNumbers: [deletedNumbers],
      sellNumbers: [sellNumbers],
      fromSellers,
      date: selectedDate,
    });

    await stokit.save();
    res.json({ success: true, stokit });
  } catch (err) {
    console.error("❌ createStokitByDate Error:", err);
    res.status(500).json({ error: err.message });
  }
};
  const refreshStokitByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const formattedDate = new Date(date).toISOString().slice(0, 10);

    // 🔹 Find all sellers
    const sellers = await NumberModel.find();

    let totalNumbers = { twoFiveSem: [], fiveSem: [], tenSem: [] };
    let totalDeleted = {
      deleteTwoFiveSem: [],
      deleteFiveSem: [],
      deleteTenSem: [],
    };
    let totalSell = {
      sellTwoFiveSem: [],
      sellFiveSem: [],
      sellTenSem: [],
    };

    let fromSellers = [];

    for (const seller of sellers) {
      // find history for this date
      const historyForDate = seller.history.find(
        (h) => h.date.toISOString().slice(0, 10) === formattedDate
      );
      if (!historyForDate) continue;

      const numbers = historyForDate.numbers?.[0] || {};
      const deleted = historyForDate.deletedNumbers?.[0] || {};
      const sell = historyForDate.sellNumbers?.[0] || {};

      totalNumbers.twoFiveSem.push(...(numbers.twoFiveSem || []));
      totalNumbers.fiveSem.push(...(numbers.fiveSem || []));
      totalNumbers.tenSem.push(...(numbers.tenSem || []));

      totalDeleted.deleteTwoFiveSem.push(...(deleted.deleteTwoFiveSem || []));
      totalDeleted.deleteFiveSem.push(...(deleted.deleteFiveSem || []));
      totalDeleted.deleteTenSem.push(...(deleted.deleteTenSem || []));

      totalSell.sellTwoFiveSem.push(...(sell.sellTwoFiveSem || []));
      totalSell.sellFiveSem.push(...(sell.sellFiveSem || []));
      totalSell.sellTenSem.push(...(sell.sellTenSem || []));

      fromSellers.push({
        sellerName: seller.name,
        sellerPhone: seller.phone,
        numbersCount:
          (numbers.twoFiveSem?.length || 0) +
          (numbers.fiveSem?.length || 0) +
          (numbers.tenSem?.length || 0),
        sellCount:
          (sell.sellTwoFiveSem?.length || 0) +
          (sell.sellFiveSem?.length || 0) +
          (sell.sellTenSem?.length || 0),
        deletedCount:
          (deleted.deleteTwoFiveSem?.length || 0) +
          (deleted.deleteFiveSem?.length || 0) +
          (deleted.deleteTenSem?.length || 0),
      });
    }

    // 🔹 Upsert stokit (create or update existing)
    let stokit = await StokitModel.findOne({
      date: { $gte: new Date(formattedDate), $lt: new Date(`${formattedDate}T23:59:59`) },
    });

    if (!stokit) {
      stokit = new StokitModel({ stokitName: `Stokit - ${formattedDate}` });
    }

    stokit.stokitNumbers = [totalNumbers];
    stokit.deletedNumbers = [totalDeleted];
    stokit.sellNumbers = [totalSell];
    stokit.fromSellers = fromSellers;
    stokit.date = new Date(formattedDate);

    await stokit.save();

    res.json({ message: "Stokit data refreshed successfully", stokit });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: err.message });
  }
};
// ✅ Get all stokits
const getAllStokits = async (req, res) => {
  try {
    const stokits = await StokitModel.find().sort({ date: -1 });
    res.json(stokits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createStokitByDate,
  getAllStokits,
  refreshStokitByDate
};
