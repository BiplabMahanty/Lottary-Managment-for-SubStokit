import React, { useState, useEffect } from "react";

export default function LotteryPayment() {
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeTab, setActiveTab] = useState("night"); // night, morning, day
  
  // Payment form data
  const [paymentData, setPaymentData] = useState({
    amountPaid: "",
    paymentMethod: "Cash",
    vouter: "",
    note: ""
  });

  // Data states
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [numberData, setNumberData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch sellers on mount
  useEffect(() => {
    fetchSellers();
  }, []);

  // Fetch data when seller or date changes
  useEffect(() => {
    if (selectedSellerId && currentDate) {
      fetchPaymentData();
      fetchDeleteData();
      fetchNumberData();
    }
  }, [selectedSellerId, currentDate]);

  const fetchSellers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/seller/getSeller");
      const data = await response.json();
      
      if (data.success) {
        setSellers(data.seller);
        if (data.seller.length > 0) {
          setSelectedSellerId(data.seller[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      alert("Failed to fetch sellers");
    }
  };

  const fetchPaymentData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/seller/getPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: selectedSellerId, dateAdded: currentDate })
      });
      const data = await response.json();
      if (data.success) {
        setPaymentInfo(data.payment);
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
    }
  };

  const fetchDeleteData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/seller/getDelete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: selectedSellerId, dateAdded: currentDate })
      });
      const data = await response.json();
      if (data.success) {
        setDeleteData(data);
      }
    } catch (error) {
      console.error("Error fetching delete data:", error);
    }
  };

  const fetchNumberData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/seller/getNumber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: selectedSellerId, dateAdded: currentDate })
      });
      const data = await response.json();
      if (data.success) {
        setNumberData(data);
      }
    } catch (error) {
      console.error("Error fetching number data:", error);
    }
  };

  const handlePayment = async () => {
    if (!selectedSellerId || !paymentData.amountPaid) {
      alert("Please enter payment amount");
      return;
    }

    const selectedSeller = sellers.find(s => s._id === selectedSellerId);
    if (!selectedSeller) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/seller/paymentDay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedSeller.name,
          phone: selectedSeller.phone,
          amountPaid: Number(paymentData.amountPaid),
          paymentMethod: paymentData.paymentMethod,
          vouter: Number(paymentData.vouter) || 0,
          note: paymentData.note
        })
      });

      const data = await response.json();
      
      if (data.success || response.ok) {
        alert("Payment successful!");
        setPaymentData({ amountPaid: "", paymentMethod: "Cash", vouter: "", note: "" });
        fetchPaymentData();
      } else {
        alert(data.error || "Payment failed");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next.toISOString().split("T")[0]);
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getDeleteTotal = () => {
    if (!deleteData) return { M: 0, D: 0, N: 0, total: 0 };
    
    const morning = deleteData.deleteMorning?.totalNumber || 0;
    const day = deleteData.deleteDay?.totalNumber || 0;
    const night = deleteData.deleteNight?.totalNumber || 0;
    
    return {
      M: morning,
      D: day,
      N: night,
      total: morning + day + night
    };
  };

  // Helper function to group consecutive numbers into ranges
  const getConsecutiveRanges = (numbers) => {
    if (!numbers || numbers.length === 0) return [];
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const ranges = [];
    let start = sorted[0];
    let end = sorted[0];
    
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push({ start, end, count: end - start + 1 });
        start = sorted[i];
        end = sorted[i];
      }
    }
    ranges.push({ start, end, count: end - start + 1 });
    
    return ranges;
  };

  const renderTableRows = () => {
    const rows = [];
    const sellerName = sellers.find(s => s._id === selectedSellerId)?.name || "N/A";
    
    if (!numberData) return rows;

    let dataToShow = null;
    let categoryName = "";

    if (activeTab === "night" && numberData.nightNumber) {
      dataToShow = numberData.nightNumber;
      categoryName = "Night";
    } else if (activeTab === "morning" && numberData.MorningNumber) {
      dataToShow = numberData.MorningNumber;
      categoryName = "Morning";
    } else if (activeTab === "day" && numberData.dayNumber) {
      dataToShow = numberData.dayNumber;
      categoryName = "Day";
    }

    if (dataToShow) {
      ['twoFiveSem', 'fiveSem', 'tenSem'].forEach(category => {
        if (dataToShow[category] && dataToShow[category].length > 0) {
          const ranges = getConsecutiveRanges(dataToShow[category]);
          ranges.forEach((range, idx) => {
            rows.push(
              <tr key={`${activeTab}-${category}-${idx}`}>
                <td className="p-2 border">{formatDate(currentDate)}</td>
                <td className="p-2 border">{sellerName}</td>
                <td className="p-2 border">{categoryName}</td>
                <td className="p-2 border">{range.start}</td>
                <td className="p-2 border">{range.end}</td>
                <td className="p-2 border">{category === 'twoFiveSem' ? '2.5 Sem' : category === 'fiveSem' ? '5 Sem' : '10 Sem'}</td>
                <td className="p-2 border">{range.count}</td>
              </tr>
            );
          });
        }
      });
    }

    return rows;
  };

  const deleteTotals = getDeleteTotal();

  return (
    <div className="flex w-full h-screen bg-gray-300">
      {/* MAIN SCREEN */}
      <div className="flex-1 p-6 relative overflow-y-auto">
        {/* TOP RIGHT DATE & BUTTON */}
        <div className="flex justify-end items-center gap-4 pr-4">
          <div className="text-lg font-medium">{formatDate(currentDate)}</div>
          <button 
            onClick={handleNextDay}
            className="bg-green-300 px-5 py-2 rounded-xl shadow hover:scale-105 transition-all"
          >
            Next Day
          </button>
        </div>

        {/* TOP CONTENT ROW */}
        <div className="flex gap-10 mt-6">
          {/* SELLER DROPDOWN */}
          <div>
            <label className="font-semibold">Seller</label>
            <select 
              value={selectedSellerId}
              onChange={(e) => setSelectedSellerId(e.target.value)}
              className="block w-64 border-2 border-gray-700 p-2 rounded mt-2 bg-white shadow"
            >
              {sellers.map(seller => (
                <option key={seller._id} value={seller._id}>
                  {seller.name} - {seller.phone}
                </option>
              ))}
            </select>
          </div>

          {/* MAIN CONTENT - PAYMENT CARD */}
          <div className="flex-1">
            <h2 className="text-2xl font-semibold mb-6">Payment Summary</h2>

            <div className="bg-white p-6 rounded-xl shadow-md w-[450px]">
              <h3 className="text-xl font-semibold text-center mb-4">Seller Payment</h3>

              <div className="space-y-3">
                <div className="flex justify-between bg-gray-100 p-3 rounded">
                  <span className="font-semibold">Seller Name</span>
                  <span>{sellers.find(s => s._id === selectedSellerId)?.name || "N/A"}</span>
                </div>

                <div className="flex justify-between bg-gray-100 p-3 rounded">
                  <span className="font-semibold">Today's Bill</span>
                  <span>₹ {paymentInfo?.todayBill || 0}</span>
                </div>

                <div className="flex justify-between bg-gray-100 p-3 rounded">
                  <span className="font-semibold">Previous Due</span>
                  <span>₹ {paymentInfo?.previousDue || 0}</span>
                </div>

                <div className="flex justify-between bg-gray-400 p-3 rounded font-semibold">
                  <span>Total Payable</span>
                  <span>₹ {(paymentInfo?.todayBill || 0) + (paymentInfo?.previousDue || 0)}</span>
                </div>

                <div className="flex justify-between bg-gray-100 p-3 rounded">
                  <span className="font-semibold">Payment Method</span>
                  <select 
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    className="block w-40 border-2 border-gray-700 rounded bg-white shadow p-1"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                    <option>Card</option>
                  </select>
                </div>

                <div className="flex justify-between bg-gray-200 p-3 rounded font-semibold">
                  <span>Voucher Amount</span>
                  <input 
                    type="number"
                    value={paymentData.vouter}
                    onChange={(e) => setPaymentData({...paymentData, vouter: e.target.value})}
                    className="border-2 border-gray-700 p-2 rounded w-40" 
                    placeholder="Voucher" 
                  />
                </div>

                <div className="flex justify-between bg-gray-200 p-3 rounded font-semibold">
                  <span>Amount Paid</span>
                  <input 
                    type="number"
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({...paymentData, amountPaid: e.target.value})}
                    className="border-2 border-gray-700 p-2 rounded w-40" 
                    placeholder="Amount" 
                  />
                </div>

                <div className="flex justify-between bg-red-100 p-3 rounded font-semibold">
                  <span>Remaining Due</span>
                  <span>₹ {paymentInfo?.remainingDue || 0}</span>
                </div>
              </div>

              <button 
                onClick={handlePayment}
                disabled={loading}
                className="mt-4 bg-green-400 w-full py-2 rounded-xl shadow hover:scale-105 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>

          {/* DELETE TICKET CARD */}
          <div className="bg-gray-200 rounded-xl shadow p-6 w-60 h-80">
            <h3 className="text-center font-semibold text-lg mb-4">Delete Ticket</h3>
            <div className="space-y-3">
              <div className="flex justify-between bg-gray-300 p-2 rounded">
                M {"=>"} <span>{deleteTotals.M}</span>
              </div>
              <div className="flex justify-between bg-gray-300 p-2 rounded">
                D {"=>"} <span>{deleteTotals.D}</span>
              </div>
              <div className="flex justify-between bg-gray-300 p-2 rounded">
                N {"=>"} <span>{deleteTotals.N}</span>
              </div>
              <div className="flex justify-between bg-gray-400 p-2 rounded font-semibold">
                Total = <span>{deleteTotals.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex gap-4 mt-10 px-6">
          <button 
            onClick={() => setActiveTab("night")}
            className={`px-6 py-2 rounded-xl shadow transition-all ${
              activeTab === "night" 
                ? "bg-blue-500 text-white scale-105" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Night
          </button>
          <button 
            onClick={() => setActiveTab("morning")}
            className={`px-6 py-2 rounded-xl shadow transition-all ${
              activeTab === "morning" 
                ? "bg-blue-500 text-white scale-105" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Morning
          </button>
          <button 
            onClick={() => setActiveTab("day")}
            className={`px-6 py-2 rounded-xl shadow transition-all ${
              activeTab === "day" 
                ? "bg-blue-500 text-white scale-105" 
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Day
          </button>
        </div>

        {/* LARGE LIST BOX */}
        <div className="mt-6 px-6">
          <div className="bg-white h-72 rounded-xl border-2 border-gray-700 shadow p-4 overflow-y-scroll">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-200 sticky top-0">
                <tr>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Seller Name</th>
                  <th className="p-2 border">Category</th>
                  <th className="p-2 border">Start Number</th>
                  <th className="p-2 border">End Number</th>
                  <th className="p-2 border">Number Type</th>
                  <th className="p-2 border">Total Number</th>
                </tr>
              </thead>
              <tbody className="font-medium text-gray-700">
                {renderTableRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}