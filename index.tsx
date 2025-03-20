// pages/index.tsx

import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = "http://20.244.56.144/test";
const WINDOW_SIZE = 10;

const App = () => {
  const [windowState, setWindowState] = useState<number[]>([]);

  const fetchNumbers = async (type: string) => {
    try {
      const response = await axios.get(`${API_BASE}/${type}`, { timeout: 500 });
      if (response.data && Array.isArray(response.data.numbers)) {
        return response.data.numbers;
      }
      throw new Error("Invalid API response format");
    } catch (error) {
      console.error(`Error fetching ${type} numbers:`, error.message);
      return [];
    }
  };

  const { data: evenNumbers, isLoading } = useQuery({
    queryKey: ["numbers", "even"],
    queryFn: () => fetchNumbers("evens"),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (evenNumbers) {
      updateWindow(evenNumbers);
    }
  }, [evenNumbers]);

  const updateWindow = (newNumbers: number[]) => {
    const uniqueNumbers = [...new Set([...windowState, ...newNumbers])];

    const updatedWindow = uniqueNumbers.length > WINDOW_SIZE
      ? uniqueNumbers.slice(uniqueNumbers.length - WINDOW_SIZE)
      : uniqueNumbers;

    setWindowState(updatedWindow);
  };

  const calculateAverage = (numbers: number[]) => {
    if (numbers.length === 0) return 0;
    return (numbers.reduce((sum, num) => sum + num, 0) / numbers.length).toFixed(2);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Average Calculator</h1>

      <div className="tabs">
        <div className="tabs-list flex gap-2">
          <button className="tab-trigger">Numbers</button>
          <button className="tab-trigger">Window State</button>
        </div>

        <div className="tab-content">
          {isLoading ? (
            <Skeleton count={5} />
          ) : (
            <div className="card p-4">
              <h2 className="text-lg font-semibold">Latest Numbers</h2>
              <p className="mt-2">{evenNumbers?.join(", ") || "No numbers received"}</p>
            </div>
          )}
        </div>

        <div className="tab-content">
          {isLoading ? (
            <Skeleton count={5} />
          ) : (
            <div className="card p-4">
              <h2 className="text-lg font-semibold">Window State</h2>
              <p className="mt-2">Previous: {windowState.slice(0, -evenNumbers.length).join(", ") || "N/A"}</p>
              <p className="mt-2">Current: {windowState.join(", ") || "No numbers stored"}</p>
              <p className="mt-2 font-bold">Average: {calculateAverage(windowState)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
