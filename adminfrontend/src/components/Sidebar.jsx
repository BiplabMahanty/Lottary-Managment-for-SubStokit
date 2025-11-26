import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Home from "./Home"
import DeleteNumber from "./DeleteNumber"
import LotteryPayment from "./Payment"
export default function Sidebar() {
  const [activePage, setActivePage] = useState("addNumber");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) navigate("/login");
  }, [navigate]);

  const Admin=JSON.parse(localStorage.getItem("adminInfo"));



  return (
    <div className="flex w-full h-screen bg-gray-300">
      {/* SIDEBAR */}
     <aside className="w-64 bg-[#92A8D1] p-6 flex flex-col gap-6">
        <div className="bg-gray-200 p-4 rounded shadow text-center text-xl font-semibold">
          Maa Lottery Center
        </div>
        <button className={`bg-gray-200 p-3 rounded-full shadow hover:scale-105 transition-all ${activePage === "addNumber" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("addNumber")}>
          AddNumber
        </button>
       
        <button className={`bg-gray-200 p-3 rounded-full shadow hover:scale-105 transition-all ${activePage === "deleteNumber" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("deleteNumber")}>
          DeleteNumbers
        </button>
       
        <button className="bg-gray-200 p-3 rounded-full shadow hover:scale-105 transition-all">
          SellNumber
        </button>
        <button className={`bg-gray-200 p-3 rounded-full shadow hover:scale-105 transition-all ${activePage === "payment" ? "bg-yellow-500 text-black" : "hover:bg-white/10"}`}
              onClick={() => setActivePage("payment")}>
          Payment
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-5">


        {activePage === "addNumber" && <Home/>}
        {activePage === "deleteNumber" && <DeleteNumber/>}
        {activePage === "payment" && <LotteryPayment/>}
       
        
      

      </div>
    </div>
  );
}
