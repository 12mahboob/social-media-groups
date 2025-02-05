import React from "react";
import { FiPlusCircle, FiUpload } from "react-icons/fi";
import BulkUpload from "./Bulkupload";

const GroupsManagement = ({ groups, showAddForm, setShowAddForm, setIsBulkUpload, isBulkUpload }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Groups</h2>
        <button onClick={() => setShowAddForm(true)} className="flex items-center bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">
          <FiPlusCircle size={20} className="mr-2" /> New Group
        </button>
        <button onClick={() => setIsBulkUpload(true)} className="flex items-center bg-green-600 text-white p-3 rounded-lg hover:bg-green-700">
          <FiUpload size={20} className="mr-2" /> Bulk Upload
        </button>
      </div>
      {isBulkUpload && <BulkUpload setIsBulkUpload={setIsBulkUpload} />}
    </div>
  );
};

export default GroupsManagement;
