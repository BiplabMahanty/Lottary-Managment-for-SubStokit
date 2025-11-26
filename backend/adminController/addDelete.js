const DeletedNightModel = require("../models/deleteNumber/deleteNight");
const DeletedMorningModel = require("../models/deleteNumber/deleteMorning");
const DeletedDayModel = require("../models/deleteNumber/deleteDay");

const NightNumberModel = require("../models/numberAdd/nightNumber");
const MorningNumberModel = require("../models/numberAdd/morningNumber");
const DayNumberModel = require("../models/numberAdd/dayNumber");

const SellNightModel = require("../models/sellNumber/sellNight");
const SellMorningModel = require("../models/sellNumber/sellMorning");
const SellDayModel = require("../models/sellNumber/sellDay");

const SellerModel = require("../models/sellerModel");
const MultiAdminModel = require("../models/multiAdmin");

const deleteNumberToSeller = async (req, res) => {
    try {
        const { name, phone, numberType, startNumber, endNumber, category } = req.body;

        if (!name || !phone || !numberType || !category|| startNumber == null || endNumber == null) {
            return res.status(400).json({ error: "All fields are required." });
        }
            if (String(startNumber).length !== 5 ) {
            return res.status(400).json({ error: "ঠিক করে লেখো।." });
        }
           
        console.log("Request Body:", req.body);
        console.log("Parsed startNumber and endNumber:", startNumber, endNumber);
        console.log("Number Type and Category:", numberType, category);

        const amountPerNumberDoc = await MultiAdminModel.findOne();
        if (!amountPerNumberDoc) {
            return res.status(500).json({ error: "Amount per number not set in admin settings." });
        }

        const validCategories = ["twoFiveSem", "fiveSem", "tenSem"];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ error: "অবৈধ বিভাগ " });
        }



        const pad5 = (num) => num.toString().padStart(5, "0");

        let start = Number(pad5(startNumber));
        let end = Number(pad5(endNumber));

        // If end < start, auto sequence as per your rule
        if (end < start) {
            end = Number(pad5(startNumber.toString().slice(0, 3) + endNumber.toString().padStart(2, "0")));
        }

        const seller = await SellerModel.findOne({ name, phone });
        if (!seller) {
            return res.status(404).json({ error: "বিক্রেতা পাওয়া যায়নি." });
        }

        // DELETE MODEL
        let deletedModel;
        if (numberType === "morning") deletedModel = DeletedMorningModel;
        else if (numberType === "day") deletedModel = DeletedDayModel;
        else if (numberType === "night") deletedModel = DeletedNightModel;
        else return res.status(400).json({ error: "Invalid numberType." });

        // NUMBER MODEL
        let numberModel;
        if (numberType === "morning") numberModel = MorningNumberModel;
        else if (numberType === "day") numberModel = DayNumberModel;
        else if (numberType === "night") numberModel = NightNumberModel;

         let sellNumberModel;
        if (numberType === "morning") sellNumberModel = SellMorningModel;
        else if (numberType === "day") sellNumberModel = SellDayModel;
        else if (numberType === "night") sellNumberModel = SellNightModel;
        else return res.status(400).json({ error: "Invalid numberType." });

        const today = new Date().toISOString().split("T")[0];

        // Generate number range
        const generatedNumbers = [];
        for (let i = start; i <= end; i++) {
            console.log("Generating number:", i);
            generatedNumbers.push(i);
        }
        console.log("Generated Numbers:", generatedNumbers);

        // Fetch existing number document
        const numberDoc = await numberModel.findOne({ sellerId: seller._id, dateAdded: today });
        if (!numberDoc || !Array.isArray(numberDoc[category])) {
            return res.status(400).json({ error: "Seller has no numbers in this category." });
        }

        const existingNumbers = numberDoc[category];

        // Missing numbers check
        const missing = generatedNumbers.filter(num => !existingNumbers.includes(num));
        if (missing.length > 0) {
            return res.status(400).json({
                error:`বিক্রেতা ${seller.name}-এর কাছে এই টিকিটগুলি নেই।`,
                missingNumbers: missing
            });
        }

        // Fetch deleted number document
        let deletedNumberDoc = await deletedModel.findOne({ sellerId: seller._id, dateAdded:today });
       
        console.log("Fetched deletedNumberDoc:", deletedNumberDoc);

        if (!deletedNumberDoc) {
            console.log("test under")
            deletedNumberDoc = new deletedModel({
                sellerId: seller._id,
                numberId: numberDoc._id,
                name,
                phone,
                dateAdded: today,
                twoFiveSem: [],
                fiveSem: [],
                tenSem: []
            });
        }

       console.log("TEST 1")

        if (!Array.isArray(deletedNumberDoc[category])) {
            deletedNumberDoc[category] = [];
        }
        console.log("TEST 2")

        // Check duplicate deleted
        const alreadyDeleted = generatedNumbers.filter(num =>
            deletedNumberDoc[category].includes(num)
        );
        console.log("TEST 3")

        if (alreadyDeleted.length > 0) {
            return res.status(400).json({
                error: "কিছু সংখ্যা ইতিমধ্যেই ফেরত দেওয়া হয়েছে।",
                alreadyDeleted
            });
        }
        console.log("TEST 1")


        // Add numbers to delete list
        deletedNumberDoc[category].push(...generatedNumbers);


        let sellNumberDoc = await sellNumberModel.findOne({ sellerId: seller._id, dateAdded: today });


        if (sellNumberDoc) {
            // Remove numbers from sell list
            sellNumberDoc[category] = sellNumberDoc[category].filter(num =>
                !generatedNumbers.includes(num)
            );


            await sellNumberDoc.save();
        }
           console.log("TEST 1")

      

        // FIXED: Now arrays 100% exist → no error
        const totalNumbers =
            deletedNumberDoc.twoFiveSem.length*amountPerNumberDoc.sem25Num+
            deletedNumberDoc.fiveSem.length*amountPerNumberDoc.sem5Num+
            deletedNumberDoc.tenSem.length*amountPerNumberDoc.sem10Num;

        deletedNumberDoc.totalAmount = totalNumbers * amountPerNumberDoc.ticketRate;

        deletedNumberDoc.totalNumber=totalNumbers;

        deletedNumberDoc.totalTwoFiveSem = deletedNumberDoc.twoFiveSem.length*amountPerNumberDoc.sem25Num,
        deletedNumberDoc.totalFiveSem = deletedNumberDoc.fiveSem.length*amountPerNumberDoc.sem5Num,
        deletedNumberDoc.totalTenSem =  deletedNumberDoc.tenSem.length*amountPerNumberDoc.sem10Num,



        await deletedNumberDoc.save();
        const totalDeletedNumbers =deletedNumberDoc.totalAmount

        if (sellNumberDoc) {
            const totalNumber =
            sellNumberDoc.twoFiveSem.length*amountPerNumberDoc.sem25Num+
            sellNumberDoc.fiveSem.length*amountPerNumberDoc.sem5Num+
            sellNumberDoc.tenSem.length*amountPerNumberDoc.sem10Num;

            sellNumberDoc.deleteamount=totalDeletedNumbers;
            sellNumberDoc.totalSell = totalNumber* amountPerNumberDoc.ticketRate;

            sellNumberDoc.totalNumber=totalNumber;


            sellNumberDoc.totalTwoFiveSem =sellNumberDoc.twoFiveSem.length*amountPerNumberDoc.sem25Num,
            sellNumberDoc.totalFiveSem= sellNumberDoc.fiveSem.length*amountPerNumberDoc.sem5Num,
            sellNumberDoc.totalTenSem=  sellNumberDoc.tenSem.length*amountPerNumberDoc.sem10Num,


            await sellNumberDoc.save();
        }

        return res.status(200).json({
            message: "Numbers deleted successfully.",
            deleted: generatedNumbers
        });

    } catch (error) {
        console.error("Error deleting numbers:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = deleteNumberToSeller;
