import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import ChatWidget from './components/ChatWidget';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [location, setLocation] = useState('');
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch history on load
  useEffect(() => {
    axios.get(`${API_BASE}/history`).then(res => setHistory(res.data));
  }, [data]); // Reload history when data changes

  const fetchWeather = async (loc) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_BASE}/weather?location=${loc}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather');
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Advisory Report: ${data.location}`, 10, 20);
    doc.setFontSize(12);
    data.advisories.forEach((adv, i) => doc.text(`- ${adv}`, 10, 40 + (i * 10)));
    doc.save('advisory.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-green-700 mb-6 text-center">Farmer Weather Advisor</h1>

        {/* Search Input */}
        <div className="flex gap-2 mb-6">
          <input 
            className="flex-1 p-3 border rounded shadow-sm"
            placeholder="Enter location (e.g. Pune)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button 
            onClick={() => fetchWeather(location)}
            className="bg-green-600 text-white px-6 rounded hover:bg-green-700 transition"
          >
            {loading ? 'Loading...' : 'Check'}
          </button>
        </div>

        {/* Error Display */}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {/* Main Dashboard */}
        {data && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weather Card */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-2xl font-bold mb-4">{data.location}, {data.country}</h2>
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Temp" value={`${data.temp}°C`} />
                <Stat label="Humidity" value={`${data.humidity}%`} />
                <Stat label="Wind" value={`${data.wind} km/h`} />
                <Stat label="Rain Prob" value={`${data.rainProb}%`} />
              </div>
            </div>

            {/* Advisory Panel */}
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-yellow-800 text-lg"> Crop Advisories</h3>
                <button onClick={downloadPDF} className="text-xs bg-yellow-200 px-2 py-1 rounded">Download PDF</button>
              </div>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {data.advisories.length ? data.advisories.map((adv, i) => (
                  <li key={i}>{adv}</li>
                )) : <li>No alerts. Standard farming applies.</li>}
              </ul>
            </div>

            {/* Chart */}
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow h-80">
              <h3 className="font-bold mb-4">Forecast Trend (Next 24 Hours)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.forecast}>
                  <XAxis dataKey="time" tickFormatter={(t) => t.split(' ')[1].slice(0,5)} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" stroke="#16a34a" strokeWidth={2} name="Temp (°C)" />
                  <Line type="monotone" dataKey="rain" stroke="#3b82f6" strokeWidth={2} name="Rain (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Searches */}
        <div className="mt-8">
          <h4 className="text-gray-500 text-sm mb-2">Recent Searches:</h4>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <span 
                key={i} 
                onClick={() => fetchWeather(h.location)}
                className="cursor-pointer bg-gray-200 px-3 py-1 rounded-full text-sm hover:bg-gray-300"
              >
                {h.location}
              </span>
            ))}
          </div>
        </div>
      </div>
      <ChatWidget />
    </div>
    
  );
}

const Stat = ({ label, value }) => (
  <div className="text-center bg-gray-50 p-3 rounded">
    <div className="text-gray-500 text-sm">{label}</div>
    <div className="font-bold text-xl">{value}</div>
  </div>
);