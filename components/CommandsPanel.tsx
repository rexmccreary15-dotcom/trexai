"use client";

import { X, Plus, Trash2, Edit2, Save } from "lucide-react";
import { useState } from "react";

interface Command {
  id: string;
  command: string;
  replacement: string;
}

interface CommandsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  onCommandsChange: (commands: Command[]) => void;
  theme: "dark" | "light";
}

export default function CommandsPanel({
  isOpen,
  onClose,
  commands,
  onCommandsChange,
  theme,
}: CommandsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCommand, setEditCommand] = useState("");
  const [editReplacement, setEditReplacement] = useState("");
  const [newCommand, setNewCommand] = useState("");
  const [newReplacement, setNewReplacement] = useState("");

  if (!isOpen) return null;

  const themeClasses = {
    bg: theme === "dark" ? "bg-gray-800" : "bg-white",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    input: theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900",
    button: theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300",
  };

  const handleAdd = () => {
    if (newCommand.trim() && newReplacement.trim()) {
      const cmd: Command = {
        id: Date.now().toString(),
        command: newCommand.trim(),
        replacement: newReplacement.trim(),
      };
      onCommandsChange([...commands, cmd]);
      setNewCommand("");
      setNewReplacement("");
    }
  };

  const handleEdit = (id: string) => {
    const cmd = commands.find((c) => c.id === id);
    if (cmd) {
      setEditingId(id);
      setEditCommand(cmd.command);
      setEditReplacement(cmd.replacement);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editCommand.trim() && editReplacement.trim()) {
      onCommandsChange(
        commands.map((c) =>
          c.id === editingId
            ? { ...c, command: editCommand.trim(), replacement: editReplacement.trim() }
            : c
        )
      );
      setEditingId(null);
      setEditCommand("");
      setEditReplacement("");
    }
  };

  const handleDelete = (id: string) => {
    onCommandsChange(commands.filter((c) => c.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`${themeClasses.bg} ${themeClasses.text} rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4`}>
        <div className={`sticky top-0 ${themeClasses.bg} border-b ${themeClasses.border} p-4 flex items-center justify-between`}>
          <h2 className="text-xl font-semibold">Custom Commands</h2>
          <button
            onClick={onClose}
            className={`p-2 ${themeClasses.button} rounded`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Command */}
          <div className={`${themeClasses.input} rounded-lg p-4 space-y-3`}>
            <h3 className="font-semibold">Add New Command</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="/command"
                value={newCommand}
                onChange={(e) => setNewCommand(e.target.value)}
                className={`flex-1 ${themeClasses.input} rounded px-3 py-2 focus:outline-none focus:border-blue-500`}
              />
              <input
                type="text"
                placeholder="Replacement text"
                value={newReplacement}
                onChange={(e) => setNewReplacement(e.target.value)}
                className={`flex-1 ${themeClasses.input} rounded px-3 py-2 focus:outline-none focus:border-blue-500`}
              />
              <button
                onClick={handleAdd}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>

          {/* Commands List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Your Commands</h3>
            {commands.length === 0 ? (
              <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} text-center py-8`}>
                No commands yet. Add one above!
              </p>
            ) : (
              commands.map((cmd) => (
                <div
                  key={cmd.id}
                  className={`${themeClasses.input} rounded-lg p-4 flex items-center gap-4`}
                >
                  {editingId === cmd.id ? (
                    <>
                      <input
                        type="text"
                        value={editCommand}
                        onChange={(e) => setEditCommand(e.target.value)}
                        className={`flex-1 ${themeClasses.input} rounded px-3 py-2 focus:outline-none focus:border-blue-500`}
                      />
                      <input
                        type="text"
                        value={editReplacement}
                        onChange={(e) => setEditReplacement(e.target.value)}
                        className={`flex-1 ${themeClasses.input} rounded px-3 py-2 focus:outline-none focus:border-blue-500`}
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 hover:bg-green-700 p-2 rounded"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditCommand("");
                          setEditReplacement("");
                        }}
                        className={`${themeClasses.button} p-2 rounded`}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="font-mono text-blue-400">{cmd.command}</span>
                        <span className={`${theme === "dark" ? "text-gray-400" : "text-gray-600"} mx-2`}>→</span>
                        <span>{cmd.replacement}</span>
                      </div>
                      <button
                        onClick={() => handleEdit(cmd.id)}
                        className={`p-2 ${themeClasses.button} rounded`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cmd.id)}
                        className="p-2 hover:bg-red-600 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
