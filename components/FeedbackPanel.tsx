"use client";

import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface FeedbackPanelProps {
  isOpen: boolean;
  onClose: () => void;
  keepItems: string[];
  stopItems: string[];
  onKeepChange: (items: string[]) => void;
  onStopChange: (items: string[]) => void;
}

export default function FeedbackPanel({
  isOpen,
  onClose,
  keepItems,
  stopItems,
  onKeepChange,
  onStopChange,
}: FeedbackPanelProps) {
  const [newKeepItem, setNewKeepItem] = useState("");
  const [newStopItem, setNewStopItem] = useState("");

  if (!isOpen) return null;

  const addKeepItem = () => {
    if (newKeepItem.trim()) {
      onKeepChange([...keepItems, newKeepItem.trim()]);
      setNewKeepItem("");
    }
  };

  const addStopItem = () => {
    if (newStopItem.trim()) {
      onStopChange([...stopItems, newStopItem.trim()]);
      setNewStopItem("");
    }
  };

  const removeKeepItem = (index: number) => {
    onKeepChange(keepItems.filter((_, i) => i !== index));
  };

  const removeStopItem = (index: number) => {
    onStopChange(stopItems.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Chat Preferences</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Keep Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-lg">Keep</h3>
            </div>
            <p className="text-sm text-gray-400">
              Things you like - the AI will do these more often
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g., Use examples in explanations"
                value={newKeepItem}
                onChange={(e) => setNewKeepItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeepItem()}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500"
              />
              <button
                onClick={addKeepItem}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {keepItems.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No items yet</p>
              ) : (
                keepItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => removeKeepItem(idx)}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stop Section */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <h3 className="font-semibold text-lg">Stop</h3>
            </div>
            <p className="text-sm text-gray-400">
              Things you don&apos;t like - the AI will avoid these
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g., Don&apos;t use technical jargon"
                value={newStopItem}
                onChange={(e) => setNewStopItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStopItem()}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={addStopItem}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={16} />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {stopItems.length === 0 ? (
                <p className="text-gray-500 text-sm italic">No items yet</p>
              ) : (
                stopItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <button
                      onClick={() => removeStopItem(idx)}
                      className="p-1 hover:bg-gray-600 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
