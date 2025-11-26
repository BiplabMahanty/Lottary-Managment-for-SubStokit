const NightNumberModel = require("../models/numberAdd/nightNumber");
const MorningNumberModel = require("../models/numberAdd/morningNumber");
const DayNumberModel = require("../models/numberAdd/dayNumber");

const SellerModel = require("../models/sellerModel");

const MultiAdminModel = require("../models/multiAdmin");

const SellNightModel = require("../models/sellNumber/sellNight");
const SellMorningModel = require("../models/sellNumber/sellMorning");
const SellDayModel = require("../models/sellNumber/sellDay");      


//fix the date problem ;
//add stokit number check;
//if the number is same give the notification also
const addNumberToSeller = async (req, res) => {
    try {
        const { name, phone, numberType, startNumber, endNumber, category } = req.body;

        if (!name || !phone || !numberType || !category) {
            return res.status(400).json({ error: "All fields are required." });
        }
         console.log("start",String(startNumber).length)

         if (String(startNumber).length !== 5 ) {
            return res.status(400).json({ error: "ঠিক করে লেখো।." });
        }

        const amountPerNumberDoc = await MultiAdminModel.findOne();
        if (!amountPerNumberDoc) {
            return res.status(500).json({ error: "Amount per number not set in admin settings." });
        }

        const validCategories = ["twoFiveSem", "fiveSem", "tenSem"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: "অবৈধ বিভাগ" });
        }

        const today = new Date().toISOString().split("T")[0];

        // Format as 5-digit integer
        // add here notification for seller dublicate number its can happan with utis toster
        const pad5 = (num) => num.toString().padStart(5, "0");

        let start = Number(pad5(startNumber));
        let end = Number(pad5(endNumber));

        // If end < start, auto sequence as per your rule
        if (end < start) {
            end = Number(pad5(startNumber.toString().slice(0, 3) + endNumber.toString().padStart(2, "0")));
        }

        const seller = await SellerModel.findOne({ name, phone });
        if (!seller) {
            return res.status(404).json({ error: "Seller not found." });
        }

        // Pick correct model
        let numberModel;
        if (numberType === "morning") numberModel = MorningNumberModel;
        else if (numberType === "day") numberModel = DayNumberModel;
        else if (numberType === "night") numberModel = NightNumberModel;
        else return res.status(400).json({ error: "Invalid numberType." });

        let sellNumberModel;
        if (numberType === "morning") sellNumberModel = SellMorningModel;
        else if (numberType === "day") sellNumberModel = SellDayModel;
        else if (numberType === "night") sellNumberModel = SellNightModel;
        else return res.status(400).json({ error: "Invalid numberType." });

        // Create number list
        const generatedNumbers = [];
        for (let i = start; i <= end; i++) {
            generatedNumbers.push(i);
        }

        /*
         * 🚫 GLOBAL DUPLICATE CHECK
         * If ANY seller (not just current seller) already has these
         * numbers on the same dateAdded + numberType => BLOCK
         */
        const globalDocs = await numberModel.find(
            { dateAdded: today },
            { twoFiveSem: 1, fiveSem: 1, tenSem: 1 }
        );

        let globalUsed = new Set();

        globalDocs.forEach(doc => {
            validCategories.forEach(cat => {
                if (Array.isArray(doc[cat])) {
                    doc[cat].forEach(num => globalUsed.add(Number(num)));
                }
            });
        });

        const globalDuplicates = generatedNumbers.filter(num => globalUsed.has(num));

        if (globalDuplicates.length > 0) {
            return res.status(400).json({
                error: "আজকের জন্য কিছু টিকিট নম্বর ইতিমধ্যেই অন্য বিক্রেতা নিয়ে নিয়েছেন।",
                duplicateNumbers: globalDuplicates
            });
        }

        // Find or create seller-based doc
        let numberDoc = await numberModel.findOne({ sellerId: seller._id, dateAdded: today });

        if (!numberDoc) {
            numberDoc = new numberModel({
                sellerId: seller._id,
                name,
                phone,
                dateAdded: today,
                twoFiveSem: [],
                fiveSem: [],
                tenSem: [],
                totalNumberAmount: 0,
                amountPerNumber: amountPerNumberDoc.ticketRate
            });
        }

        let sellNumberDoc = await sellNumberModel.findOne({ sellerId: seller._id, dateAdded: today });
        if (!sellNumberDoc) {
            sellNumberDoc = new sellNumberModel({
                sellerId: seller._id,
                numberId: numberDoc._id,
                dateAdded: today,
                twoFiveSem: [], 
                fiveSem: [],
                tenSem: [],
                totalSell: 0
            });
        }


        


        if (!Array.isArray(numberDoc[category])) {
            numberDoc[category] = [];
        }

        // Local duplicate check
        const existingNumbers = numberDoc[category].map(n => Number(n));
        const uniqueNumbers = generatedNumbers.filter(num => !existingNumbers.includes(num));

        if (uniqueNumbers.length === 0) {
            return res.status(400).json({ error: "এই বিক্রেতার জন্য ইতিমধ্যেই সমস্ত নম্বর বিদ্যমান।" });
        }

        numberDoc[category].push(...uniqueNumbers);

        // Recalculate total amount
        const totalNumbers =
            numberDoc.twoFiveSem.length*amountPerNumberDoc.sem25Num+
            numberDoc.fiveSem.length*amountPerNumberDoc.sem5Num+
            numberDoc.tenSem.length*amountPerNumberDoc.sem10Num;

        numberDoc.totalNumberAmount = totalNumbers * amountPerNumberDoc.ticketRate;

        const totalNum=numberDoc.twoFiveSem.length+numberDoc.fiveSem.length+numberDoc.tenSem.length
        console.log("total>>",totalNum);

        numberDoc.totalNumber=totalNumbers;

        numberDoc.totalTwoFiveSem =numberDoc.twoFiveSem.length*amountPerNumberDoc.sem25Num,
        numberDoc.totalFiveSem= numberDoc.fiveSem.length*amountPerNumberDoc.sem5Num,
        numberDoc.totalTenSem=  numberDoc.tenSem.length*amountPerNumberDoc.sem10Num,


        await numberDoc.save();

        sellNumberDoc[category].push(...uniqueNumbers);

        // Recalculate total amount
        const totalNumber =
            sellNumberDoc.twoFiveSem.length*amountPerNumberDoc.sem25Num+
            sellNumberDoc.fiveSem.length*amountPerNumberDoc.sem5Num+
            sellNumberDoc.tenSem.length*amountPerNumberDoc.sem10Num;

        
        sellNumberDoc.totalNumberAmount = totalNumber* amountPerNumberDoc.ticketRate;

        console.log("total Length :",totalNumber.length);
        sellNumberDoc.totalSell=sellNumberDoc.totalNumberAmount;

        

        sellNumberDoc.totalNumber=totalNumber;

        sellNumberDoc.totalTwoFiveSem =numberDoc.twoFiveSem.length*amountPerNumberDoc.sem25Num,
        sellNumberDoc.totalFiveSem= numberDoc.fiveSem.length*amountPerNumberDoc.sem5Num,
        sellNumberDoc.totalTenSem=  numberDoc.tenSem.length*amountPerNumberDoc.sem10Num,


        await sellNumberDoc.save();

       
       
        res.json({
            success: true,
            message: `${uniqueNumbers.length} numbers added successfully.`,
            addedNumbers: uniqueNumbers,
            totalNumbers,
            totalNumberAmount: numberDoc.totalNumberAmount
        });

    } catch (err) {
        console.error("Error adding numbers:", err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = addNumberToSeller;


