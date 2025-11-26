const NumberModel = require("../models/numberAdd/morningNumber");


const Payment = async (req, res) => {
  try {
    const { name, phone, amountPaid, vautur,newHistory } = req.body;

    if (!name || !phone || amountPaid === undefined)
      return res.status(400).json({ error: "All fields required" });

    const seller = await NumberModel.findOne({ name, phone });
    if (!seller) return res.status(404).json({ error: "Seller not found" });

    seller.vauter+=vautur

    seller.amountPaid += amountPaid;
    const totalAmount=seller.amountPaid+vautur;

    console.log("amoun",seller.amountPaid)
    seller.remainingDue = seller.totalBill - amountPaid;

    seller.totalBill=seller.remainingDue

    console.log("remaning",seller.remainingDue);

    const deu=seller.remainingDue;
    console.log("deu",deu)
    seller.remainingDue=deu-vautur;


    seller.totalBill=seller.remainingDue
    const totalBill=seller.totalBill

    console.log("latestremani",seller.remainingDue)
    const amountToReturn = seller.remainingDue;

    console.log("aMR",amountToReturn);
    
    if (seller.remainingDue < 0) seller.remainingDue = 0;
    

    // ✅ Handle history based on newHistory flag
    if (newHistory || seller.history.length === 0) {
      // Create NEW history entry
      seller.history.push({
        action: "Payment",
        numbers: seller.numbers.length > 0 ? [{ ...seller.numbers[0] }] : [],
        amountPaid: amountPaid,
        totalAmountPaid: seller.amountPaid,
        remainingDue: seller.remainingDue,
        returnAmount: amountToReturn,
        date: new Date(),
      });
    } else {
      // Update LAST history entry
      const lastHistory = seller.history[seller.history.length - 1];
      lastHistory.action = "Payment";
      lastHistory.amountPaid = seller.amountPaid ;
      lastHistory.vauter=seller.vauter
      lastHistory.totalBill=totalBill;
      lastHistory.totalAmountPaid=totalAmount;
      lastHistory.remainingDue = seller.remainingDue;
      lastHistory.returnAmount = amountToReturn;
      lastHistory.date = new Date();
    }

    await seller.save();
    res.json({ message: "Payment updated successfully", seller });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports={Payment}