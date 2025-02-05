import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";
import { supabase } from "../../config/supabaseClient";
const BulkUpload = ({ setIsBulkUpload }) => {
  const [inputData, setInputData] = useState(""); // For pasted CSV content
  const [file, setFile] = useState(null); // For file upload
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ total: 0, success: 0, failed: 0 });
  const [errors, setErrors] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const parseCSV = (csvString) => {
    const rows = csvString.split("\n").map(row => row.trim()).filter(row => row);
    if (rows.length < 2) return [];

    const headers = rows[0].split(",").map(h => h.trim());
    return rows.slice(1).map(row => {
      const values = row.split(",").map(val => val.trim());
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || "";
      });
      return obj;
    });
  };

  const handleUpload = async () => {
    setUploading(true);
    setErrors([]);
    setProgress({ total: 0, success: 0, failed: 0 });

    let parsedData = [];

    // If a file is uploaded, read and parse it
    if (file) {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        parsedData = XLSX.utils.sheet_to_json(sheet);
        processUpload(parsedData);
      };
    } 
    // If text is pasted, parse CSV manually
    else if (inputData.trim() !== "") {
      try {
        parsedData = parseCSV(inputData);
        processUpload(parsedData);
      } catch (error) {
        setErrors([{ error: "Invalid CSV format" }]);
        setUploading(false);
      }
    } 
    // If no input
    else {
      setErrors([{ error: "Please upload a file or paste valid CSV data" }]);
      setUploading(false);
    }
  };

  const processUpload = async (data) => {
    setProgress({ total: data.length, success: 0, failed: 0 });
    let successCount = 0;
    let failedCount = 0;
    let failedRecords = [];

    for (const record of data) {
      if (!record.name || !record.description || !record.link || !record.category_id) {
        failedRecords.push({ ...record, error: "Missing required fields" });
        failedCount++;
        continue;
      }
      const { error } = await supabase.from("groups").insert([record]);
      if (error) {
        failedRecords.push({ ...record, error: error.message });
        failedCount++;
      } else {
        successCount++;
      }
      setProgress({ total: data.length, success: successCount, failed: failedCount });
    }
    setErrors(failedRecords);
    setUploading(false);
    setInputData(""); // Clear input field
    setFile(null); // Reset file

    // ✅ **Close Modal after Upload Completes**
    if (failedRecords.length === 0) {
      setTimeout(() => setIsBulkUpload(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <motion.div className="bg-gray-800 p-6 rounded-lg w-96 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Bulk Upload</h2>

          {/* Single Input Field for File Upload or Paste */}
          <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} className="text-white mb-2" />
          <textarea
            placeholder="Paste CSV data here..."
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="w-full p-2 mb-4 bg-gray-700 text-white rounded h-32"
          />

          {/* Upload & Close Buttons */}
          <div className="flex justify-between">
            <button onClick={() => setIsBulkUpload(false)} className="bg-red-500 text-white p-2 rounded-lg">
              Cancel
            </button>
            <button onClick={handleUpload} disabled={uploading} className="bg-green-600 text-white p-2 rounded-lg">
              {uploading ? "Uploading..." : "Submit"}
            </button>
          </div>

          {/* Progress Display */}
          {progress.total > 0 && (
            <div className="text-white text-sm mt-4">
              <p>Total Records: {progress.total}</p>
              <p>Success: {progress.success}</p>
              <p>Failed: {progress.failed}</p>
            </div>
          )}

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="mt-4 text-red-400 text-sm overflow-y-auto max-h-32">
              <h3 className="font-bold">Errors:</h3>
              {errors.map((err, idx) => (
                <p key={idx}>{err.error}</p>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BulkUpload;
