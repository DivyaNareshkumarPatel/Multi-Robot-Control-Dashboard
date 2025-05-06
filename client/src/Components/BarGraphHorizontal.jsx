import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getAllChats } from "../api/api";

const BarGraphHorizontal = ({ robotId }) => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await getAllChats();
        const allChats = res.data;
        const conversationCounts = {};

        allChats.forEach((chat) => {
          chat.messages.forEach((message) => {
            console.log(message.text);
            if (message.text.includes(robotId)) {
              const date = new Date(chat.createdAt);
              const month = date.toLocaleString("default", { month: "short" });
              const year = date.getFullYear();
              const key = `${month}-${year}`;

              if (conversationCounts[key]) {
                conversationCounts[key]++;
              } else {
                conversationCounts[key] = 1;
              }
            }
          });
        });

        const finalData = Object.entries(conversationCounts).map(
          ([key, count]) => {
            const [month, year] = key.split("-");
            return { month, year: +year, conversations: count };
          }
        );

        setData(finalData);
      } catch (err) {
        console.error("Failed to fetch or process chat data:", err);
      }
    };

    fetchChats();
  }, [robotId]);

  const filteredData = data.filter((item) => {
    const yearMatch = selectedYear === "All" || item.year === +selectedYear;
    const monthMatch = selectedMonth === "All" || item.month === selectedMonth;
    return yearMatch && monthMatch;
  });

  const years = ["All", ...Array.from(new Set(data.map((d) => d.year)))];
  const months = [
    "All",
    ...Array.from(
      new Set(
        data
          .filter((d) => selectedYear === "All" || d.year === +selectedYear)
          .map((d) => d.month)
      )
    ),
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        height: "500px",
        margin: "0 auto",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "12px",
        color: "#000",
      }}
    >
      <h3 style={{ textAlign: "center", color: "#000", marginBottom: "10px" }}>
        {robotId
          ? `${robotId} - Monthly Conversation Count`
          : "Monthly Conversation Count"}
      </h3>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label style={{ marginRight: "8px" }}>Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedMonth("All");
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ marginRight: "8px" }}>Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={filteredData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis type="number" stroke="#007bff" />
          <YAxis type="category" dataKey="month" stroke="#007bff" />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
            labelStyle={{ color: "#000" }}
            itemStyle={{ color: "#007bff" }}
          />
          <Bar
            dataKey="conversations"
            fill="#007bff"
            barSize={40}
            activeBar={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraphHorizontal;
