import axios from "axios";
import React, { useState, useEffect } from "react";


export default function LotteryDelete() {
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const[sellerDetails,setSellerDetails]=useState([])
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Form states for adding numbers
  const [formData, setFormData] = useState({
    category: "twoFiveSem",
    numberType: "night",
    startNumber: "",
    endNumber: ""
  });
  console.log("seller",sellerDetails)
  console.log("selleriD",selectedSellerId)

  // Data states
  const [sellData, setSellData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [numberData, setNumberData] = useState([]);
  const [multiAdmin,setMultiAdmin]=useState([]);
  const [loading, setLoading] = useState(false);

  console.log("multi",multiAdmin)
  const hi=multiAdmin.sem25Num  
  console.log(">>>,",hi)

  // Fetch sellers on mount
  useEffect(() => {
    fetchSellers();
  }, []);

   useEffect(() => {
    fetchMultiAdmin();
  }, []);

  // Fetch data when seller or date changes
  useEffect(() => {
    if (selectedSellerId && currentDate) {
      fetchSellData();
      fetchDeleteData();
      fetchNumberData();
    }
  }, [selectedSellerId, currentDate]);

  useEffect(() => {
  if (!selectedSellerId) return;

  async function fetchSeller() {
    try {
      const res = await axios.get(`http://localhost:8000/api/seller/getsellerById/${selectedSellerId}`);
      setSellerDetails(res.data.seller); 
    } catch (err) {
      console.error("Error fetching seller:", err);
    }
  }

  fetchSeller();
}, [selectedSellerId]); 


  const fetchMultiAdmin = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/seller/getMultiAdmin");
      
      
      if (response.data.success) {
        setMultiAdmin(response.data.multiAdmin);

       
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      alert("Failed to fetch sellers");
    }
  };

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

  const fetchSellData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/seller/getSell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: selectedSellerId, dateAdded: currentDate })
      });
      const data = await response.json();
      if (data.success) {
        setSellData(data);
      }
    } catch (error) {
      console.error("Error fetching sell data:", error);
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

  const handleAddNumber = async () => {
    if (!selectedSellerId || !formData.startNumber || !formData.endNumber) {
      alert("Please fill all fields and select a seller");
      return;
    }

    const selectedSeller = sellers.find(s => s._id === selectedSellerId);
    if (!selectedSeller) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/seller/deleteNumberToSeller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedSeller.name,
          phone: selectedSeller.phone,
          numberType: formData.numberType,
          startNumber: formData.startNumber,
          endNumber: formData.endNumber,
          category: formData.category
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        setFormData({ ...formData, startNumber: "", endNumber: "" });
        // Refresh data
        fetchDeleteData();
        fetchNumberData();
      } else {
        alert(data.error || "Failed to delete numbers");
      }
    } catch (error) {
      console.error("Error deleting numbers:", error);
      alert("Failed to delete numbers");
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

  const getSellTotal = () => {
    if (!sellData) return { M: 0, D: 0, N: 0, total: 0 };
    
    const morning = sellData.sellMorning?.totalNumber || 0;
    const day = sellData.sellDay?.totalNumber || 0;
    const night = sellData.sellNight?.totalNumber || 0;
    
    return {
      M: morning,
      D: day,
      N: night,
      total: morning + day + night
    };
  };

  // Show NUMBER data in DELETE card (swapped)
  const getDeleteTotal = () => {
    if (!numberData) return { M: 0, D: 0, N: 0, total: 0 };
    
    const morning = numberData.MorningNumber?.totalNumber || 0;
    const day = numberData.dayNumber?.totalNumber || 0;
    const night = numberData.nightNumber?.totalNumber || 0;
    
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

  // Show DELETE data in table (swapped)
  const renderTableRows = () => {
    const rows = [];
    const sellerName = sellers.find(s => s._id === selectedSellerId)?.name || "N/A";
    
    // Process Deleted Night Numbers
    if (deleteData?.deleteNight) {
      const data = deleteData.deleteNight;
      
      // Process each category
      ['twoFiveSem', 'fiveSem', 'tenSem'].forEach(category => {
        if (data[category] && data[category].length > 0) {
          const ranges = getConsecutiveRanges(data[category]);
          ranges.forEach((range, idx) => {
            rows.push(
              <tr key={`night-${category}-${idx}`}>
                <td className="p-2 border">{formatDate(currentDate)}</td>
                <td className="p-2 border">{sellerName}</td>
                <td className="p-2 border">Night</td>
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

    // Process Deleted Morning Numbers
    if (deleteData?.deleteMorning) {
      const data = deleteData.deleteMorning;
      
      ['twoFiveSem', 'fiveSem', 'tenSem'].forEach(category => {
        if (data[category] && data[category].length > 0) {
          const ranges = getConsecutiveRanges(data[category]);
          ranges.forEach((range, idx) => {
            rows.push(
              <tr key={`morning-${category}-${idx}`}>
                <td className="p-2 border">{formatDate(currentDate)}</td>
                <td className="p-2 border">{sellerName}</td>
                <td className="p-2 border">Morning</td>
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

    // Process Deleted Day Numbers
    if (deleteData?.deleteDay) {
      const data = deleteData.deleteDay;
      
      ['twoFiveSem', 'fiveSem', 'tenSem'].forEach(category => {
        if (data[category] && data[category].length > 0) {
          const ranges = getConsecutiveRanges(data[category]);
          ranges.forEach((range, idx) => {
            rows.push(
              <tr key={`day-${category}-${idx}`}>
                <td className="p-2 border">{formatDate(currentDate)}</td>
                <td className="p-2 border">{sellerName}</td>
                <td className="p-2 border">Day</td>
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

  const sellTotals = getSellTotal();
  const deleteTotals = getDeleteTotal();

  const imageURL = sellerDetails?.sellerImage
    ? `http://localhost:8000/${sellerDetails.sellerImage}`
    : null;
    console.log("image   >>>>>>>>>",sellerDetails.sellerImage);

  return (
    <div className="flex w-full h-screen bg-gray-300">

      


      {/* MAIN SCREEN */}
      <div className="flex-1 p-6 relative overflow-y-auto">
      
             
         <h1 class="text-3xl md:text-3xl font-extrabold justify-center items-cente text-gray-900 leading-tight">
            Return 
        </h1>
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
            <label className="font-semibold"> <img
                src={imageURL}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover justify-left items-left border border-red"
              />
            Seller</label>
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

          {/* SELL TICKET CARD */}
          <div className="bg-gray-200 rounded-xl shadow p-6 w-60">
            <h3 className="text-center font-semibold text-lg mb-4">Sell Ticket</h3>
            <div className="space-y-3">
              <div className="flex justify-between bg-gray-300 p-2 rounded">
                M {"=>"} <span>{sellTotals.M}</span>
              </div>
              <div className="flex justify-between bg-gray-300 p-2 rounded">
                D {"=>"} <span>{sellTotals.D}</span>
              </div>
              <div className="flex justify-between bg-gray-300 p-2 rounded">
                N {"=>"} <span>{sellTotals.N}</span>
              </div>
              <div className="flex justify-between bg-gray-400 p-2 rounded font-semibold">
                Total = <span>{sellTotals.total}</span>
              </div>
            </div>
          </div>

          {/* DELETE TICKET CARD - Now shows NUMBER data */}
          <div className="bg-gray-200 rounded-xl shadow p-6 w-60">
            <h3 className="text-center font-semibold text-lg mb-4">Available Numbers</h3>
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

        {/* DELETE NUMBER INPUTS */}
        <div className="flex items-end gap-4 mt-10 px-6">
          <div>
            <label className="block text-sm font-semibold">Number Type</label>
            <select 
              value={formData.numberType}
              onChange={(e) => setFormData({ ...formData, numberType: e.target.value })}
              className="border-2 border-gray-700 px-4 py-2 rounded shadow bg-white"
            >
              <option value="night">Night</option>
              <option value="morning">Morning</option>
              <option value="day">Day</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Category</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border-2 border-gray-700 px-4 py-2 rounded shadow bg-white"
            >
              <option value="twoFiveSem">2.5 Sem</option>
              <option value="fiveSem">5 Sem</option>
              <option value="tenSem">10 Sem</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Start Number</label>
            <input 
              value={formData.startNumber}
              onChange={(e) => setFormData({ ...formData, startNumber: e.target.value })}
              className="border-2 border-gray-700 p-2 rounded w-40" 
              placeholder="Start" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">End Number</label>
            <input 
              value={formData.endNumber}
              onChange={(e) => setFormData({ ...formData, endNumber: e.target.value })}
              className="border-2 border-gray-700 p-2 rounded w-40" 
              placeholder="End" 
            />
          </div>
          <button 
            onClick={handleAddNumber}
            disabled={loading}
            className="bg-red-400 px-6 py-2 rounded shadow hover:bg-red-500 transition-all disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>

        {/* DELETED NUMBERS TABLE */}
        <div className="mt-10 px-6">
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
                  <th className="p-2 border">Total Deleted</th>
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