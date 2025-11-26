const SellNightModel = require("../models/sellNumber/sellNight");
const SellMorningModel = require("../models/sellNumber/sellMorning");
const SellDayModel = require("../models/sellNumber/sellDay");

const SellerModel = require("../models/sellerModel");
const MultiAdminModel = require("../models/multiAdmin");

const PaymentModel = require("../models/payment");

//Date Fix not clear ;
//sepate old deu ;
//give error in leave days ;
//payment today if seller pay lessthen total


const paymentDay = async (req, res) => {

    try {

        const { name, phone, amountPaid, paymentMethod, note ,vouter} = req.body;

        const seller = await SellerModel.findOne({ name, phone })

        if (!seller) {
            return res.status(404).json({ error: "Seller not found." });
        }

        const todayStr = new Date();

        const nextDay = new Date(todayStr);
        nextDay.setDate(nextDay.getDate() + 1);
        console.log("next",nextDay)

        // create new date object for yesterday
        const yesterday = new Date(nextDay);
        yesterday.setDate(yesterday.getDate() - 1);


        


       

        
        

        // format both dates to YYYY-MM-DD
        const today = nextDay.toISOString().split("T")[0];
        const previousDayStr = yesterday.toISOString().split("T")[0];

        console.log("Today:", today);
        console.log("Previous Day:", previousDayStr);

        const prePayment=await PaymentModel.findOne({sellerId: seller._id, dateAdded: previousDayStr })|| { remainingDue: 0 };

        const sellMorning = await SellMorningModel.findOne({ sellerId: seller._id, dateAdded: today }) || { totalSell: 0 };
        const sellDay = await SellDayModel.findOne({ sellerId: seller._id, dateAdded: today }) || { totalSell: 0 };
        const sellNight = await SellNightModel.findOne({ sellerId: seller._id, dateAdded: today }) || { totalSell: 0 };


        console.log("night", sellNight.totalSell);
        console.log("day", sellDay.totalSell);
        console.log("morning", sellMorning.totalSell);

        const total =
            sellDay.totalSell + sellMorning.totalSell + sellNight.totalSell

        console.log("total", total)

        let payment = await PaymentModel.findOne({
            sellerId: seller._id,
            dateAdded: today
        });

        

        if (!payment) {
            payment = new PaymentModel({
                sellerId: seller._id,
                dateAdded: today,
                paymentMethod,
                note,
                amountPaid:amountPaid || 0,
                vouter:vouter || 0,
                previousDue: 0,
                totalAmount: 0,
                remainingDue: 0,
            });
        }
        payment.todayRemaining= 0;



        payment.todayBill = total;

        console.log("privious", payment.previousDue);

        //const Amount = total + payment.previousDue;
        //console.log("amount", Amount);

        console.log("paid", payment.amountPaid);

        payment.amountPaid = payment.amountPaid + amountPaid;
        console.log("amountpaid", payment.amountPaid)

        payment.todayRemaining=total-payment.amountPaid;

        const amount=total+prePayment.remainingDue;

        payment.vouter=vouter;


      

        payment.remainingDue = amount - payment.amountPaid;
        console.log("remainingdue", payment.remainingDue)


        payment.remainingDue=payment.remainingDue-vouter;

        if (payment.remainingDue<=0) {

            console.log("tes")
            payment.remainingDue=0;

            
        }

       

        //payment.totalAmount = total + payment.previousDue + payment.remainingDue;
        //console.log("totalAmount", payment.totalAmount)

        console.log("test")
        await payment.save();





    } catch (err) {
        console.error("Error adding numbers:", err);
        return res.status(500).json({ error: "Internal server error.", err });

    }
}

module.exports = paymentDay;
