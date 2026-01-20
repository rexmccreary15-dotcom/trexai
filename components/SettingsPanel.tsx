"use client";

import { X, Eye, EyeOff, Save, Moon, Sun, Lock, Unlock, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  incognitoMode: boolean;
  onIncognitoChange: (value: boolean) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  maxTokens: number;
  onMaxTokensChange: (value: number) => void;
  theme: "dark" | "light";
  onThemeChange: (value: "dark" | "light") => void;
  background: string;
  onBackgroundChange: (value: string) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  incognitoMode,
  onIncognitoChange,
  temperature,
  onTemperatureChange,
  maxTokens,
  onMaxTokensChange,
  theme,
  onThemeChange,
  background,
  onBackgroundChange,
}: SettingsPanelProps) {
  const [codeInput, setCodeInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeSuccess, setCodeSuccess] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load background preferences
  useEffect(() => {
    const savedImage = localStorage.getItem("custom-background-image");
    const savedColor = localStorage.getItem("custom-background-color");
    if (savedImage) {
      setBackgroundImage(savedImage);
    }
    if (savedColor) {
      setSelectedColor(savedColor);
    }
  }, []);

  useEffect(() => {
    const unlocked = localStorage.getItem("incognito-unlocked") === "true";
    setIsUnlocked(unlocked);
  }, []);

  const handleCodeSubmit = () => {
    const code = codeInput.trim().toLowerCase();
    let success = false;
    
    if (code === "incog25") {
      if (!isUnlocked) {
        setIsUnlocked(true);
        localStorage.setItem("incognito-unlocked", "true");
        setCodeSuccess("✓ Incognito mode unlocked!");
        setCodeError("");
        success = true;
      } else {
        setCodeSuccess("✓ Incognito mode already unlocked!");
        setCodeError("");
        success = true;
      }
    } else if (code === "maker15") {
      const creatorUnlocked = localStorage.getItem("creator-unlocked") === "true";
      if (!creatorUnlocked) {
        localStorage.setItem("creator-unlocked", "true");
        setCodeSuccess("✓ Creator Controls unlocked!");
        setCodeError("");
        success = true;
      } else {
        setCodeSuccess("✓ Creator Controls already unlocked!");
        setCodeError("");
        success = true;
      }
    }
    
    if (success) {
      setCodeInput("");
      setTimeout(() => setCodeSuccess(""), 3000);
    } else {
      setCodeError("Incorrect code. Please try again.");
      setCodeSuccess("");
      setCodeInput("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4`}>
        <div className={`sticky top-0 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-b p-4 flex items-center justify-between`}>
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon size={20} className="text-purple-400" />
                ) : (
                  <Sun size={20} className="text-yellow-500" />
                )}
                <div>
                  <label className="font-semibold">Theme</label>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Switch between dark and light mode
                  </p>
                </div>
              </div>
              <button
                onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
                className={`relative w-14 h-7 rounded-full transition-colors ${theme === "dark" ? "bg-purple-600" : "bg-yellow-500"
                  }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${theme === "dark" ? "translate-x-7" : "translate-x-0"
                    }`}
                />
              </button>
            </div>
          </div>


          {/* Temperature */}
          <div className="space-y-2">
            <label className="font-semibold">
              Temperature: {temperature.toFixed(1)}
            </label>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Controls randomness. Lower = more focused, Higher = more creative
            </p>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Focused</span>
              <span>Balanced</span>
              <span>Creative</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div className="space-y-2">
            <label className="font-semibold">
              Max Tokens: {maxTokens}
            </label>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              Maximum length of AI response
            </p>
            <input
              type="range"
              min="100"
              max="4000"
              step="100"
              value={maxTokens}
              onChange={(e) => onMaxTokensChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Short</span>
              <span>Medium</span>
              <span>Long</span>
            </div>
          </div>

          {/* Code Input - Always visible */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Lock size={20} className={theme === "dark" ? "text-gray-400" : "text-gray-600"} />
              <div className="flex-1">
                <label className="font-semibold">Enter Unlock Code</label>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  Enter codes to unlock features
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={codeInput}
                onChange={(e) => {
                  setCodeInput(e.target.value);
                  setCodeError("");
                  setCodeSuccess("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCodeSubmit();
                  }
                }}
                placeholder="Enter code..."
                className={`flex-1 px-3 py-2 rounded ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-gray-100 text-gray-900 border-gray-300"
                } border focus:outline-none focus:border-purple-500`}
              />
              <button
                onClick={handleCodeSubmit}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                Submit
              </button>
            </div>
            {codeError && (
              <p className="text-sm text-red-500">{codeError}</p>
            )}
            {codeSuccess && (
              <p className="text-sm text-green-500">{codeSuccess}</p>
            )}
          </div>

          {/* Incognito Mode - Only shown if unlocked */}
          {isUnlocked && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {incognitoMode ? (
                    <EyeOff size={20} className="text-purple-400" />
                  ) : (
                    <Eye size={20} className="text-gray-400" />
                  )}
                  <div>
                    <label className="font-semibold">Incognito Mode</label>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                      Chat history will not be saved when enabled
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onIncognitoChange(!incognitoMode)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${incognitoMode ? "bg-purple-600" : "bg-gray-600"
                    }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${incognitoMode ? "translate-x-7" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Custom Background */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="font-semibold">Custom Background</h3>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const imageData = event.target?.result as string;
                      setBackgroundImage(imageData);
                      setSelectedColor(""); // Clear color selection
                      onBackgroundChange(imageData);
                      localStorage.setItem("custom-background-image", imageData);
                      localStorage.removeItem("custom-background-color");
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full px-4 py-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
                  theme === "dark"
                    ? "border-gray-600 hover:border-purple-500 bg-gray-700/50 hover:bg-gray-700"
                    : "border-gray-300 hover:border-purple-500 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <ImageIcon size={20} />
                <span>Upload Background Image</span>
              </button>
            </div>

            {/* Primary Color Options */}
            <div className="space-y-2">
              <p className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                Or choose a color:
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { name: "Red", color: "#ef4444" },
                  { name: "Blue", color: "#3b82f6" },
                  { name: "Green", color: "#10b981" },
                  { name: "Yellow", color: "#fbbf24" },
                  { name: "Purple", color: "#a855f7" },
                ].map((colorOption) => (
                  <button
                    key={colorOption.color}
                    onClick={() => {
                      setSelectedColor(colorOption.color);
                      setBackgroundImage(""); // Clear image
                      onBackgroundChange(colorOption.color);
                      localStorage.setItem("custom-background-color", colorOption.color);
                      localStorage.removeItem("custom-background-image");
                    }}
                    className={`h-12 rounded-lg border-2 transition-all ${
                      selectedColor === colorOption.color || (!selectedColor && !backgroundImage && background === colorOption.color)
                        ? "border-white ring-2 ring-purple-500"
                        : theme === "dark"
                        ? "border-gray-600 hover:border-gray-400"
                        : "border-gray-300 hover:border-gray-500"
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  />
                ))}
              </div>
            </div>

            {/* Reset to Default */}
            <button
              onClick={() => {
                setBackgroundImage("");
                setSelectedColor("");
                const defaultColor = "#0f172a"; // Dark navy
                onBackgroundChange(defaultColor);
                localStorage.removeItem("custom-background-image");
                localStorage.removeItem("custom-background-color");
              }}
              className={`w-full px-4 py-2 rounded-lg transition-colors ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-900"
              }`}
            >
              Reset to Default
            </button>
          </div>

          {/* Other Options */}
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="font-semibold">Additional Options</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span>Stream responses</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Show token count</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span>Auto-scroll to latest message</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span>Enable code syntax highlighting</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
