"use client";

import { X, Key, Github, Code, Eye, EyeOff, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface AccountSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeysChange: (keys: ApiKeys) => void;
  onGitHubChange: (connected: boolean, token?: string) => void;
  onCodingModeChange: (enabled: boolean) => void;
  theme: "dark" | "light";
}

interface ApiKeys {
  openai: string;
  gemini: string;
  claude: string;
}

export default function AccountSettings({
  isOpen,
  onClose,
  onApiKeysChange,
  onGitHubChange,
  onCodingModeChange,
  theme,
}: AccountSettingsProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: "",
    gemini: "",
    claude: "",
  });
  const [showKeys, setShowKeys] = useState({
    openai: false,
    gemini: false,
    claude: false,
  });
  const [gitHubConnected, setGitHubConnected] = useState(false);
  const [gitHubToken, setGitHubToken] = useState("");
  const [codingMode, setCodingMode] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved API keys
    const savedKeys = localStorage.getItem("ai-chat-api-keys");
    if (savedKeys) {
      try {
        const keys = JSON.parse(savedKeys);
        setApiKeys(keys);
      } catch (e) {
        console.error("Failed to load API keys");
      }
    }

    // Load GitHub status
    const ghToken = localStorage.getItem("github-token");
    if (ghToken) {
      setGitHubConnected(true);
      setGitHubToken(ghToken);
    }

    // Load coding mode
    const coding = localStorage.getItem("coding-mode") === "true";
    setCodingMode(coding);
  }, []);

  const handleSave = () => {
    // Save API keys (in production, these should be encrypted)
    localStorage.setItem("ai-chat-api-keys", JSON.stringify(apiKeys));
    onApiKeysChange(apiKeys);

    // Save GitHub
    if (gitHubToken) {
      localStorage.setItem("github-token", gitHubToken);
      onGitHubChange(true, gitHubToken);
    } else {
      localStorage.removeItem("github-token");
      onGitHubChange(false);
    }

    // Save coding mode
    localStorage.setItem("coding-mode", codingMode.toString());
    onCodingModeChange(codingMode);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearKey = (key: keyof ApiKeys) => {
    setApiKeys((prev) => ({ ...prev, [key]: "" }));
  };

  const handleGitHubConnect = () => {
    // In production, this would use OAuth
    // For now, we'll use a personal access token
    const token = prompt(
      "Enter your GitHub Personal Access Token:\n\n" +
      "1. Go to: https://github.com/settings/tokens\n" +
      "2. Generate new token (classic)\n" +
      "3. Select scopes: repo, workflow\n" +
      "4. Copy and paste the token here:"
    );
    if (token && token.trim()) {
      setGitHubToken(token.trim());
      setGitHubConnected(true);
    }
  };

  const handleGitHubDisconnect = () => {
    setGitHubToken("");
    setGitHubConnected(false);
    localStorage.removeItem("github-token");
    onGitHubChange(false);
  };

  if (!isOpen) return null;

  if (!isOpen) return null;

  const themeClasses = {
    bg: theme === "dark" ? "bg-gray-800" : "bg-white",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    input: theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900",
    button: theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`${themeClasses.bg} ${themeClasses.text} rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4`}>
        <div className={`sticky top-0 ${themeClasses.bg} border-b ${themeClasses.border} p-4 flex items-center justify-between`}>
          <h2 className="text-xl font-semibold">Account Settings</h2>
          <button
            onClick={onClose}
            className={`p-2 ${themeClasses.button} rounded`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* API Keys Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Key size={20} />
              API Keys (Optional)
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Your website can work in <strong>Free Mode</strong> by default (powered by a server-side key configured by the site owner). Add your own API keys here to use premium AI models (ChatGPT, Gemini, Claude).
            </p>
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-200">
                💡 <strong>Free Mode:</strong> Visitors don&apos;t need keys. The <em>deployer</em> must set <code>HUGGINGFACE_API_KEY</code> in Vercel (or <code>.env.local</code>) for Free Mode to work.
              </p>
            </div>

            {/* OpenAI */}
            <div className="space-y-2">
              <label className="font-medium">OpenAI (ChatGPT)</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKeys.openai ? "text" : "password"}
                    value={apiKeys.openai}
                    onChange={(e) =>
                      setApiKeys((prev) => ({ ...prev, openai: e.target.value }))
                    }
                    placeholder="sk-..."
                    className={`w-full ${themeClasses.input} rounded px-3 py-2 pr-10 focus:outline-none focus:border-blue-500`}
                  />
                  <button
                    onClick={() =>
                      setShowKeys((prev) => ({
                        ...prev,
                        openai: !prev.openai,
                      }))
                    }
                    className={`absolute right-2 top-2 p-1 ${themeClasses.button} rounded`}
                  >
                    {showKeys.openai ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {apiKeys.openai && (
                  <button
                    onClick={() => handleClearKey("openai")}
                    className="p-2 hover:bg-red-600 rounded"
                    title="Clear"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                Get your key at:{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  platform.openai.com/api-keys
                </a>
              </p>
            </div>

            {/* Gemini */}
            <div className="space-y-2">
              <label className="font-medium">Google Gemini</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKeys.gemini ? "text" : "password"}
                    value={apiKeys.gemini}
                    onChange={(e) =>
                      setApiKeys((prev) => ({ ...prev, gemini: e.target.value }))
                    }
                    placeholder="AIza..."
                    className={`w-full ${themeClasses.input} rounded px-3 py-2 pr-10 focus:outline-none focus:border-blue-500`}
                  />
                  <button
                    onClick={() =>
                      setShowKeys((prev) => ({
                        ...prev,
                        gemini: !prev.gemini,
                      }))
                    }
                    className={`absolute right-2 top-2 p-1 ${themeClasses.button} rounded`}
                  >
                    {showKeys.gemini ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {apiKeys.gemini && (
                  <button
                    onClick={() => handleClearKey("gemini")}
                    className="p-2 hover:bg-red-600 rounded"
                    title="Clear"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                Get your key at:{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  makersuite.google.com/app/apikey
                </a>
              </p>
            </div>

            {/* Claude */}
            <div className="space-y-2">
              <label className="font-medium">Anthropic Claude</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKeys.claude ? "text" : "password"}
                    value={apiKeys.claude}
                    onChange={(e) =>
                      setApiKeys((prev) => ({ ...prev, claude: e.target.value }))
                    }
                    placeholder="sk-ant-..."
                    className={`w-full ${themeClasses.input} rounded px-3 py-2 pr-10 focus:outline-none focus:border-blue-500`}
                  />
                  <button
                    onClick={() =>
                      setShowKeys((prev) => ({
                        ...prev,
                        claude: !prev.claude,
                      }))
                    }
                    className={`absolute right-2 top-2 p-1 ${themeClasses.button} rounded`}
                  >
                    {showKeys.claude ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                {apiKeys.claude && (
                  <button
                    onClick={() => handleClearKey("claude")}
                    className="p-2 hover:bg-red-600 rounded"
                    title="Clear"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className={`text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
                Get your key at:{" "}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>
          </div>

          {/* GitHub Section */}
          <div className={`space-y-4 pt-4 border-t ${themeClasses.border}`}>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Github size={20} />
              GitHub Integration
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Connect GitHub to enable website building and code generation features.
            </p>

            {gitHubConnected ? (
              <div className="bg-green-900 border border-green-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-300">GitHub Connected</p>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Token: {gitHubToken.substring(0, 10)}...
                    </p>
                  </div>
                  <button
                    onClick={handleGitHubDisconnect}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${themeClasses.input} rounded-lg p-4`}>
                <p className={`mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  Connect your GitHub account to enable:
                </p>
                <ul className={`list-disc list-inside text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"} mb-4 space-y-1`}>
                  <li>Automatic website building</li>
                  <li>Code repository creation</li>
                  <li>File generation and commits</li>
                </ul>
                <button
                  onClick={handleGitHubConnect}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded flex items-center gap-2"
                >
                  <Github size={16} />
                  Connect GitHub
                </button>
              </div>
            )}
          </div>

          {/* Coding Mode */}
          <div className={`space-y-4 pt-4 border-t ${themeClasses.border}`}>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Code size={20} />
              Coding Mode
            </h3>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Enable enhanced coding features and website building capabilities.
            </p>

            <div className={`flex items-center justify-between ${themeClasses.input} rounded-lg p-4`}>
              <div>
                <p className="font-semibold">Enable Coding Mode</p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {codingMode
                    ? "AI will focus on code generation and website building"
                    : "Standard chat mode"}
                </p>
              </div>
              <button
                onClick={() => setCodingMode(!codingMode)}
                className={`relative w-14 h-7 rounded-full transition-colors ${codingMode ? "bg-blue-600" : "bg-gray-600"
                  }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${codingMode ? "translate-x-7" : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
            >
              <Save size={18} />
              {saved ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
