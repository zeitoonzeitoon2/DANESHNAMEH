// src/Flashcard.jsx

import React, { useState, useCallback } from "react";
import { Handle, Position } from "reactflow";

const Flashcard = ({ data, onChange, onClose, allNodes, currentNodeId, onLinkClick }) => {
  // state for managing new description text
  const [newDescriptionText, setNewDescriptionText] = useState('');

  // updates the node's label
  const handleLabelChange = useCallback((e) => {
    onChange({ label: e.target.value });
  }, [onChange]);

  // updates the description text
  const handleDescriptionChange = useCallback((e, descId) => {
    const newDescriptions = data.descriptions.map(desc =>
      desc.id === descId ? { ...desc, text: e.target.value } : desc
    );
    onChange({ descriptions: newDescriptions });
  }, [data.descriptions, onChange]);

  // adds a new description and link
  const handleAddDescription = useCallback(() => {
    if (newDescriptionText.trim() !== '') {
      const newDescriptions = [...data.descriptions, { id: Date.now(), text: newDescriptionText, link: '' }];
      onChange({ descriptions: newDescriptions });
      setNewDescriptionText('');
    }
  }, [newDescriptionText, data.descriptions, onChange]);

  // removes a description and link
  const handleRemoveDescription = useCallback((descId) => {
    const newDescriptions = data.descriptions.filter(desc => desc.id !== descId);
    onChange({ descriptions: newDescriptions });
  }, [data.descriptions, onChange]);

  // updates the linked nodes list
  const handleLinkedNodeChange = useCallback((e) => {
    const selectedNodeId = e.target.value;
    const newLinkedNodes = [...data.linkedNodes];
    if (!newLinkedNodes.includes(selectedNodeId) && selectedNodeId !== '') {
      newLinkedNodes.push(selectedNodeId);
    }
    onChange({ linkedNodes: newLinkedNodes });
  }, [data.linkedNodes, onChange]);

  // removes a linked node
  const handleRemoveLinkedNode = useCallback((nodeId) => {
    const newLinkedNodes = data.linkedNodes.filter(id => id !== nodeId);
    onChange({ linkedNodes: newLinkedNodes });
  }, [data.linkedNodes, onChange]);

  // filters out the current node from the list of all nodes
  const availableNodes = allNodes.filter(node => node.id !== currentNodeId);

  return (
    <div className="flashcard-container">
      <button onClick={onClose} className="flashcard-close-button">×</button>
      <div className="p-4">
        <label className="flashcard-label">
          عنوان:
          <input
            type="text"
            value={data.label}
            onChange={handleLabelChange}
            className="flashcard-input mt-2"
          />
        </label>
        
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">توضیحات و لینک‌ها</h3>
          {data.descriptions.map((desc) => (
            <div key={desc.id} className="mb-2 p-2 bg-slate-700 rounded-md flex items-start">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault(); // prevents default link behavior
                  onLinkClick(desc.id, desc.text);
                }}
                className="w-full text-blue-400 hover:text-blue-200 underline cursor-pointer transition-colors duration-200 text-sm p-2"
              >
                {desc.text}
              </a>
              <button
                onClick={() => handleRemoveDescription(desc.id)}
                className="ml-2 mt-1 text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                حذف
              </button>
            </div>
          ))}

          <div className="flex items-center mt-2">
            <input
              type="text"
              value={newDescriptionText}
              onChange={(e) => setNewDescriptionText(e.target.value)}
              placeholder="توضیح جدید..."
              className="w-full flashcard-input"
            />
            <button onClick={handleAddDescription} className="ml-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
              افزودن
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">گره‌های مرتبط</h3>
          {data.linkedNodes.map((linkedNodeId) => {
            const linkedNode = allNodes.find(n => n.id === linkedNodeId);
            return linkedNode ? (
              <div key={linkedNodeId} className="flex items-center mb-2">
                <span className="flex-grow">{linkedNode.data.label}</span>
                <button
                  onClick={() => handleRemoveLinkedNode(linkedNodeId)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  حذف
                </button>
              </div>
            ) : null;
          })}
          <select
            onChange={handleLinkedNodeChange}
            className="w-full flashcard-input"
            value="" // Reset select value after selection
          >
            <option value="" disabled>افزودن گره مرتبط</option>
            {availableNodes.map(node => (
              <option key={node.id} value={node.id}>{node.data.label}</option>
            ))}
          </select>
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="a" />
      <Handle type="target" position={Position.Left} id="b" />
    </div>
  );
};

export default Flashcard;
