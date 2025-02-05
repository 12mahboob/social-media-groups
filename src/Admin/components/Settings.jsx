import React from "react";

const Settings = ({ settings, handleThemeChange, handleNotificationsChange, handleSettingsSubmit }) => {
  return (
    <form onSubmit={handleSettingsSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg">
      <label className="block text-white">Dark Mode</label>
      <input type="checkbox" checked={settings.theme === "dark"} onChange={handleThemeChange} className="mr-2" />
      <label className="block text-white">Email Notifications</label>
      <input type="checkbox" checked={settings.notificationsEnabled} onChange={handleNotificationsChange} className="mr-2" />
      <button type="submit" className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">Save Settings</button>
    </form>
  );
};

export default Settings;
