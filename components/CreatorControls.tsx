"use client";

import { X, BarChart3, Palette, Shield, Settings, Users, Download, Zap, Key, ToggleLeft, FileText } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

interface CreatorControlsProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "dark" | "light";
}

export default function CreatorControls({
  isOpen,
  onClose,
  theme,
}: CreatorControlsProps) {
  const [activeTab, setActiveTab] = useState<string>("analytics");
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [brandingSettings, setBrandingSettings] = useState<any>({});
  const [moderationSettings, setModerationSettings] = useState<any>({});
  const [aiConfigSettings, setAiConfigSettings] = useState<any>({});
  const [rateLimitSettings, setRateLimitSettings] = useState<any>({});
  const [featureSettings, setFeatureSettings] = useState<any>({});
  const [advancedSettings, setAdvancedSettings] = useState<any>({});

  // Define functions BEFORE useEffect hooks that use them
  const fetchSettings = async (type: string, setter: any) => {
    try {
      const response = await fetch(`/api/settings/${type}`);
      const data = await response.json();
      setter(data.setting_value || {});
    } catch (error) {
      console.error(`Error fetching ${type} settings:`, error);
    }
  };

  const saveSettings = async (type: string, data: any) => {
    try {
      const response = await fetch(`/api/settings/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error(`Error saving ${type} settings:`, error);
      alert("Failed to save settings");
    }
  };

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const response = await fetch(`/api/users?page=${usersPage}&limit=20`);
      const data = await response.json();
      setUsers(data.users || []);
      setUsersTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [usersPage]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      // Add timestamp to prevent browser caching
      const response = await fetch(`/api/analytics?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      console.log("Analytics API response:", data);
      if (data.error) {
        console.error("Analytics API returned error:", data.error, data.errorMessage);
        alert(`Analytics Error: ${data.errorMessage || data.error}`);
      }
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalytics({
        totalMessages: 0,
        activeUsers: 0,
        totalUsers: 0,
        messagesToday: 0,
        peakUsageTime: "N/A",
        popularModels: [],
      });
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Fetch analytics when analytics tab is opened, and auto-refresh every 3 seconds
  useEffect(() => {
    if (isOpen && activeTab === "analytics") {
      // Fetch immediately
      fetchAnalytics();
      
      // Auto-refresh every 3 seconds when analytics tab is open
      const interval = setInterval(() => {
        console.log("Auto-refreshing analytics...");
        fetchAnalytics();
      }, 3000); // Reduced to 3 seconds for faster updates
      
      return () => {
        console.log("Clearing analytics interval");
        clearInterval(interval);
      };
    }
  }, [isOpen, activeTab, fetchAnalytics]);

  // Fetch users when users tab is opened
  useEffect(() => {
    if (isOpen && activeTab === "users") {
      fetchUsers();
    }
  }, [isOpen, activeTab, fetchUsers]);

  // Fetch settings when respective tabs are opened
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "branding") fetchSettings("branding", setBrandingSettings);
      if (activeTab === "moderation") fetchSettings("moderation", setModerationSettings);
      if (activeTab === "ai-config") fetchSettings("ai_config", setAiConfigSettings);
      if (activeTab === "rate-limit") fetchSettings("rate_limit", setRateLimitSettings);
      if (activeTab === "features") fetchSettings("features", setFeatureSettings);
      if (activeTab === "advanced") fetchSettings("advanced", setAdvancedSettings);
    }
  }, [isOpen, activeTab]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setSelectedUser(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const banUser = async (userId: string, ban: boolean, reason?: string) => {
    try {
      await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_banned: ban,
          ban_reason: reason || null,
        }),
      });
      fetchUsers(); // Refresh list
      if (selectedUser?.id === userId) {
        fetchUserDetails(userId);
      }
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user and all their data? This cannot be undone.")) {
      return;
    }
    try {
      await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      fetchUsers(); // Refresh list
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (!isOpen) return null;

  const themeClasses = {
    bg: theme === "dark" ? "bg-gray-800" : "bg-white",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    hover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100",
    input: theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900",
    card: theme === "dark" ? "bg-gray-700" : "bg-gray-50",
    button: theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600",
  };

  const tabs = [
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "ai-config", label: "AI Config", icon: Settings },
    { id: "users", label: "Users", icon: Users },
    { id: "export", label: "Export", icon: Download },
    { id: "rate-limit", label: "Rate Limits", icon: Zap },
    { id: "api-keys", label: "API Keys", icon: Key },
    { id: "features", label: "Features", icon: ToggleLeft },
    { id: "advanced", label: "Advanced", icon: FileText },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`${themeClasses.bg} ${themeClasses.text} rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden m-4 flex flex-col`}>
        {/* Header */}
        <div className={`${themeClasses.bg} ${themeClasses.border} border-b p-4 flex items-center justify-between`}>
          <h2 className="text-xl font-semibold">Creator Controls</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded ${themeClasses.hover}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className={`${themeClasses.card} border-r ${themeClasses.border} w-48 overflow-y-auto`}>
            <div className="p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                      activeTab === tab.id
                        ? theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                        : `${themeClasses.hover} ${themeClasses.text}`
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Analytics & Usage Stats</h3>
                  <button
                    onClick={fetchAnalytics}
                    disabled={analyticsLoading}
                    className={`${themeClasses.button} text-white px-3 py-1 rounded text-sm disabled:opacity-50`}
                  >
                    {analyticsLoading ? "Loading..." : "Refresh"}
                  </button>
                </div>
                {analyticsLoading && !analytics ? (
                  <div className={`${themeClasses.card} p-8 rounded-lg text-center`}>
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Loading analytics...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`${themeClasses.card} p-4 rounded-lg`}>
                        <div className="text-2xl font-bold">{analytics?.totalMessages || 0}</div>
                        <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Total Messages</div>
                      </div>
                      <div className={`${themeClasses.card} p-4 rounded-lg`}>
                        <div className="text-2xl font-bold">{analytics?.activeUsers || 0}</div>
                        <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Active Users (24h)</div>
                      </div>
                      <div className={`${themeClasses.card} p-4 rounded-lg`}>
                        <div className="text-2xl font-bold">{analytics?.peakUsageTime || "N/A"}</div>
                        <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Peak Usage Time</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`${themeClasses.card} p-4 rounded-lg`}>
                        <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                        <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Total Users</div>
                      </div>
                      <div className={`${themeClasses.card} p-4 rounded-lg`}>
                        <div className="text-2xl font-bold">{analytics?.messagesToday || 0}</div>
                        <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Messages Today</div>
                      </div>
                    </div>
                    <div className={`${themeClasses.card} p-4 rounded-lg`}>
                      <h4 className="font-semibold mb-3">Popular AI Models</h4>
                      {analytics?.popularModels && analytics.popularModels.length > 0 ? (
                        <div className="space-y-2">
                          {analytics.popularModels.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="capitalize">{item.model}</span>
                              <span className={`font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                                {item.count} messages
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          No model usage data yet.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === "branding" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Custom Branding</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Site Title</label>
                    <input
                      type="text"
                      value={brandingSettings.siteTitle || "TREXAI"}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, siteTitle: e.target.value })}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Custom Logo URL</label>
                    <input
                      type="text"
                      value={brandingSettings.logoUrl || ""}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Welcome Message</label>
                    <textarea
                      value={brandingSettings.welcomeMessage || ""}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, welcomeMessage: e.target.value })}
                      placeholder="Enter a custom welcome message..."
                      rows={3}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Custom System Prompt</label>
                    <textarea
                      value={brandingSettings.systemPrompt || ""}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, systemPrompt: e.target.value })}
                      placeholder="Enter a custom system prompt for all AI models..."
                      rows={4}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <button 
                    onClick={() => saveSettings("branding", brandingSettings)}
                    className={`${themeClasses.button} text-white px-4 py-2 rounded`}
                  >
                    Save Branding Settings
                  </button>
                </div>
              </div>
            )}

            {/* Moderation Tab */}
            {activeTab === "moderation" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Content Moderation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Blocked Words (one per line)</label>
                    <textarea
                      value={moderationSettings.blockedWords || ""}
                      onChange={(e) => setModerationSettings({ ...moderationSettings, blockedWords: e.target.value })}
                      placeholder="Enter words to filter..."
                      rows={6}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Content Guidelines</label>
                    <textarea
                      value={moderationSettings.guidelines || ""}
                      onChange={(e) => setModerationSettings({ ...moderationSettings, guidelines: e.target.value })}
                      placeholder="Enter content guidelines that will be shown to users..."
                      rows={4}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={moderationSettings.enabled || false}
                      onChange={(e) => setModerationSettings({ ...moderationSettings, enabled: e.target.checked })}
                    />
                    <label>Enable automatic content filtering</label>
                  </div>
                  <button 
                    onClick={() => saveSettings("moderation", moderationSettings)}
                    className={`${themeClasses.button} text-white px-4 py-2 rounded`}
                  >
                    Save Moderation Settings
                  </button>
                </div>
              </div>
            )}

            {/* AI Config Tab */}
            {activeTab === "ai-config" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Advanced AI Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Default AI Model</label>
                    <select 
                      value={aiConfigSettings.defaultModel || "myai"}
                      onChange={(e) => setAiConfigSettings({ ...aiConfigSettings, defaultModel: e.target.value })}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    >
                      <option value="myai">MyAI (Free)</option>
                      <option value="openai">ChatGPT</option>
                      <option value="gemini">Gemini</option>
                      <option value="claude">Claude</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Default Temperature: {aiConfigSettings.defaultTemperature || 0.7}</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="2" 
                      step="0.1" 
                      value={aiConfigSettings.defaultTemperature || 0.7}
                      onChange={(e) => setAiConfigSettings({ ...aiConfigSettings, defaultTemperature: parseFloat(e.target.value) })}
                      className="w-full" 
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Focused</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Default Max Tokens</label>
                    <input 
                      type="number" 
                      value={aiConfigSettings.defaultMaxTokens || 2000}
                      onChange={(e) => setAiConfigSettings({ ...aiConfigSettings, defaultMaxTokens: parseInt(e.target.value) })}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`} 
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Custom System Prompt per Model</label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm">MyAI:</label>
                        <textarea 
                          rows={2} 
                          value={aiConfigSettings.systemPrompts?.myai || ""}
                          onChange={(e) => setAiConfigSettings({ 
                            ...aiConfigSettings, 
                            systemPrompts: { ...(aiConfigSettings.systemPrompts || {}), myai: e.target.value }
                          })}
                          className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`} 
                        />
                      </div>
                      <div>
                        <label className="text-sm">ChatGPT:</label>
                        <textarea 
                          rows={2} 
                          value={aiConfigSettings.systemPrompts?.openai || ""}
                          onChange={(e) => setAiConfigSettings({ 
                            ...aiConfigSettings, 
                            systemPrompts: { ...(aiConfigSettings.systemPrompts || {}), openai: e.target.value }
                          })}
                          className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4"
                        checked={aiConfigSettings.enabledModels?.openai !== false}
                        onChange={(e) => setAiConfigSettings({ 
                          ...aiConfigSettings, 
                          enabledModels: { ...(aiConfigSettings.enabledModels || {}), openai: e.target.checked }
                        })}
                      />
                      <label>Enable ChatGPT</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4"
                        checked={aiConfigSettings.enabledModels?.gemini !== false}
                        onChange={(e) => setAiConfigSettings({ 
                          ...aiConfigSettings, 
                          enabledModels: { ...(aiConfigSettings.enabledModels || {}), gemini: e.target.checked }
                        })}
                      />
                      <label>Enable Gemini</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4"
                        checked={aiConfigSettings.enabledModels?.claude !== false}
                        onChange={(e) => setAiConfigSettings({ 
                          ...aiConfigSettings, 
                          enabledModels: { ...(aiConfigSettings.enabledModels || {}), claude: e.target.checked }
                        })}
                      />
                      <label>Enable Claude</label>
                    </div>
                  </div>
                  <button 
                    onClick={() => saveSettings("ai_config", aiConfigSettings)}
                    className={`${themeClasses.button} text-white px-4 py-2 rounded`}
                  >
                    Save AI Configuration
                  </button>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">User Management</h3>
                  <button
                    onClick={fetchUsers}
                    disabled={usersLoading}
                    className={`${themeClasses.button} text-white px-3 py-1 rounded text-sm disabled:opacity-50`}
                  >
                    {usersLoading ? "Loading..." : "Refresh"}
                  </button>
                </div>
                
                {usersLoading && users.length === 0 ? (
                  <div className={`${themeClasses.card} p-8 rounded-lg text-center`}>
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className={`${themeClasses.card} p-8 rounded-lg text-center`}>
                    <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>No users found.</p>
                  </div>
                ) : (
                  <>
                    <div className={`${themeClasses.card} p-4 rounded-lg overflow-x-auto`}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`border-b ${themeClasses.border}`}>
                            <th className="text-left p-2">Session ID</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Messages</th>
                            <th className="text-left p-2">Last Active</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className={`border-b ${themeClasses.border} hover:${themeClasses.hover}`}>
                              <td className="p-2 font-mono text-xs">{user.session_id?.substring(0, 20)}...</td>
                              <td className="p-2">{user.email || "—"}</td>
                              <td className="p-2">{user.message_count || 0}</td>
                              <td className="p-2">
                                {user.last_active 
                                  ? new Date(user.last_active).toLocaleDateString()
                                  : "—"}
                              </td>
                              <td className="p-2">
                                {user.is_banned ? (
                                  <span className="text-red-500">Banned</span>
                                ) : (
                                  <span className="text-green-500">Active</span>
                                )}
                              </td>
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => fetchUserDetails(user.id)}
                                    className={`${themeClasses.button} text-white px-2 py-1 rounded text-xs`}
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => banUser(user.id, !user.is_banned)}
                                    className={`px-2 py-1 rounded text-xs ${
                                      user.is_banned
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-red-600 hover:bg-red-700 text-white"
                                    }`}
                                  >
                                    {user.is_banned ? "Unban" : "Ban"}
                                  </button>
                                  <button
                                    onClick={() => deleteUser(user.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {usersTotal > 20 && (
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          Showing {((usersPage - 1) * 20) + 1}-{Math.min(usersPage * 20, usersTotal)} of {usersTotal} users
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                            disabled={usersPage === 1}
                            className={`${themeClasses.button} text-white px-3 py-1 rounded text-sm disabled:opacity-50`}
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setUsersPage(p => p + 1)}
                            disabled={usersPage * 20 >= usersTotal}
                            className={`${themeClasses.button} text-white px-3 py-1 rounded text-sm disabled:opacity-50`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedUser && (
                      <div className={`${themeClasses.card} p-4 rounded-lg`}>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">User Details</h4>
                          <button
                            onClick={() => setSelectedUser(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><strong>ID:</strong> <span className="font-mono text-xs">{selectedUser.id}</span></p>
                          <p><strong>Session ID:</strong> <span className="font-mono text-xs">{selectedUser.session_id}</span></p>
                          <p><strong>Email:</strong> {selectedUser.email || "Not set"}</p>
                          <p><strong>Messages:</strong> {selectedUser.message_count || 0}</p>
                          <p><strong>Created:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
                          <p><strong>Last Active:</strong> {new Date(selectedUser.last_active).toLocaleString()}</p>
                          {selectedUser.is_banned && (
                            <p><strong>Ban Reason:</strong> {selectedUser.ban_reason || "No reason provided"}</p>
                          )}
                        </div>
                        {selectedUser.chats && selectedUser.chats.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-semibold mb-2">User&apos;s Chats ({selectedUser.chats.length})</h5>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {selectedUser.chats.map((chat: any) => (
                                <div key={chat.id} className={`p-2 rounded ${themeClasses.bg} border ${themeClasses.border}`}>
                                  <p className="font-medium">{chat.title || "Untitled Chat"}</p>
                                  <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                                    {chat.message_count} messages • {new Date(chat.updated_at).toLocaleDateString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Export Tab */}
            {activeTab === "export" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Export & Backup</h3>
                <div className="space-y-4">
                  <div className={`${themeClasses.card} p-4 rounded-lg`}>
                    <h4 className="font-semibold mb-2">Export Chat Data</h4>
                    <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Export all chat conversations and user data.
                    </p>
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/export?type=chats");
                          const data = await response.json();
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `trexai-chats-${new Date().toISOString().split("T")[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          alert("Failed to export chats");
                        }
                      }}
                      className={`${themeClasses.button} text-white px-4 py-2 rounded`}
                    >
                      Export as JSON
                    </button>
                  </div>
                  <div className={`${themeClasses.card} p-4 rounded-lg`}>
                    <h4 className="font-semibold mb-2">Backup Settings</h4>
                    <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Backup all configurations and settings.
                    </p>
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/export?type=settings");
                          const data = await response.json();
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `trexai-settings-${new Date().toISOString().split("T")[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          alert("Failed to export settings");
                        }
                      }}
                      className={`${themeClasses.button} text-white px-4 py-2 rounded`}
                    >
                      Download Backup
                    </button>
                  </div>
                  <div className={`${themeClasses.card} p-4 rounded-lg`}>
                    <h4 className="font-semibold mb-2">Export Everything</h4>
                    <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Export all data including users, chats, messages, settings, and analytics.
                    </p>
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/export?type=all");
                          const data = await response.json();
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `trexai-full-backup-${new Date().toISOString().split("T")[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          alert("Failed to export data");
                        }
                      }}
                      className={`${themeClasses.button} text-white px-4 py-2 rounded`}
                    >
                      Export All Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rate Limits Tab */}
            {activeTab === "rate-limit" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Rate Limiting & Controls</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Messages per Minute</label>
                    <input 
                      type="number" 
                      value={rateLimitSettings.messagesPerMinute || 10}
                      onChange={(e) => setRateLimitSettings({ ...rateLimitSettings, messagesPerMinute: parseInt(e.target.value) })}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`} 
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Cooldown Period (seconds)</label>
                    <input 
                      type="number" 
                      value={rateLimitSettings.cooldownSeconds || 0}
                      onChange={(e) => setRateLimitSettings({ ...rateLimitSettings, cooldownSeconds: parseInt(e.target.value) })}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`} 
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Daily Usage Cap per User</label>
                    <input 
                      type="number" 
                      value={rateLimitSettings.dailyCap || 100}
                      onChange={(e) => setRateLimitSettings({ ...rateLimitSettings, dailyCap: parseInt(e.target.value) })}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`} 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={rateLimitSettings.enabled || false}
                      onChange={(e) => setRateLimitSettings({ ...rateLimitSettings, enabled: e.target.checked })}
                    />
                    <label>Enable rate limiting</label>
                  </div>
                  <button 
                    onClick={() => saveSettings("rate_limit", rateLimitSettings)}
                    className={`${themeClasses.button} text-white px-4 py-2 rounded`}
                  >
                    Save Rate Limits
                  </button>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === "api-keys" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Server-Side API Key Management</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">HuggingFace API Key (for Free Mode)</label>
                    <input
                      type="password"
                      placeholder="hf_..."
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      This key is used for MyAI (free mode) when users don&apos;t provide their own keys.
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium mb-2">OpenAI API Key (Optional)</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Gemini API Key (Optional)</label>
                    <input
                      type="password"
                      placeholder="AIza..."
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div className={`${themeClasses.card} p-3 rounded`}>
                    <p className={`text-sm ${theme === "dark" ? "text-yellow-300" : "text-yellow-700"}`}>
                      ⚠️ Server-side keys are stored in environment variables. Update them in your Vercel dashboard or .env.local file.
                    </p>
                  </div>
                  <button className={`${themeClasses.button} text-white px-4 py-2 rounded`}>
                    Save API Keys
                  </button>
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === "features" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Feature Toggles</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Incognito Mode</label>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Allow users to use incognito mode</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5"
                      checked={featureSettings.incognitoMode !== false}
                      onChange={(e) => setFeatureSettings({ ...featureSettings, incognitoMode: e.target.checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Image Uploads</label>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Allow users to upload images</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5"
                      checked={featureSettings.imageUploads !== false}
                      onChange={(e) => setFeatureSettings({ ...featureSettings, imageUploads: e.target.checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Custom Commands</label>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Allow users to create custom commands</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5"
                      checked={featureSettings.customCommands !== false}
                      onChange={(e) => setFeatureSettings({ ...featureSettings, customCommands: e.target.checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Chat History</label>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Save chat history locally</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5"
                      checked={featureSettings.chatHistory !== false}
                      onChange={(e) => setFeatureSettings({ ...featureSettings, chatHistory: e.target.checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Feedback System</label>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Allow users to provide feedback</p>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5"
                      checked={featureSettings.feedbackSystem !== false}
                      onChange={(e) => setFeatureSettings({ ...featureSettings, feedbackSystem: e.target.checked })}
                    />
                  </div>
                  <button 
                    onClick={() => saveSettings("features", featureSettings)}
                    className={`${themeClasses.button} text-white px-4 py-2 rounded`}
                  >
                    Save Feature Settings
                  </button>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === "advanced" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-medium mb-2">Chat Retention Policy (days)</label>
                    <input 
                      type="number" 
                      value={advancedSettings.retentionDays || 30}
                      onChange={(e) => setAdvancedSettings({ ...advancedSettings, retentionDays: parseInt(e.target.value) })}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`} 
                    />
                    <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Automatically delete chats older than this number of days.
                    </p>
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Custom Error Messages</label>
                    <textarea
                      value={advancedSettings.customErrors || ""}
                      onChange={(e) => setAdvancedSettings({ ...advancedSettings, customErrors: e.target.value })}
                      placeholder="Enter custom error messages..."
                      rows={4}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Default Incognito Mode</label>
                    <select 
                      value={advancedSettings.defaultIncognito || "optional"}
                      onChange={(e) => setAdvancedSettings({ ...advancedSettings, defaultIncognito: e.target.value })}
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 border focus:outline-none focus:border-blue-500`}
                    >
                      <option value="disabled">Disabled</option>
                      <option value="enabled">Enabled</option>
                      <option value="optional">Optional</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={advancedSettings.debugMode || false}
                      onChange={(e) => setAdvancedSettings({ ...advancedSettings, debugMode: e.target.checked })}
                    />
                    <label>Enable debug mode</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      checked={advancedSettings.verboseLogging || false}
                      onChange={(e) => setAdvancedSettings({ ...advancedSettings, verboseLogging: e.target.checked })}
                    />
                    <label>Enable verbose logging</label>
                  </div>
                  <button 
                    onClick={() => saveSettings("advanced", advancedSettings)}
                    className={`${themeClasses.button} text-white px-4 py-2 rounded`}
                  >
                    Save Advanced Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
