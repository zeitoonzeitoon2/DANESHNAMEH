// src/Flashcard.jsx
import React, { useState, useMemo } from "react";

export default function Flashcard({ data, onChange, onClose, allNodes, currentNodeId }) {
  const [label, setLabel] = useState(data.label || "");
  const [descriptions, setDescriptions] = useState(data.descriptions || []);
  const [linkedNodes, setLinkedNodes] = useState(data.linkedNodes || []);
  const [linkTarget, setLinkTarget] = useState("");

  const handleDataChange = (newData) => {
    onChange({
      label,
      descriptions,
      linkedNodes,
      ...newData,
    });
  };

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
    handleDataChange({ label: e.target.value });
  };

  const handleDescriptionChange = (id, field, value) => {
    const newDescriptions = descriptions.map(desc => 
      desc.id === id ? { ...desc, [field]: value } : desc
    );
    setDescriptions(newDescriptions);
    handleDataChange({ descriptions: newDescriptions });
  };

  const addDescription = () => {
    const newDescriptions = [...descriptions, { id: Date.now(), text: '', link: '' }];
    setDescriptions(newDescriptions);
    handleDataChange({ descriptions: newDescriptions });
  };

  const removeDescription = (id) => {
    const newDescriptions = descriptions.filter(desc => desc.id !== id);
    setDescriptions(newDescriptions);
    handleDataChange({ descriptions: newDescriptions });
  };

  const linkOptions = useMemo(() => {
    const existingLinks = new Set(linkedNodes);
    return allNodes.filter(node => node.id !== currentNodeId && !existingLinks.has(node.id));
  }, [allNodes, currentNodeId, linkedNodes]);

  const handleAddLink = () => {
    if (linkTarget && !linkedNodes.includes(linkTarget)) {
      const newLinkedNodes = [...linkedNodes, linkTarget];
      setLinkedNodes(newLinkedNodes);
      handleDataChange({ linkedNodes: newLinkedNodes });
      setLinkTarget("");
    }
  };

  const handleRemoveLink = (nodeIdToRemove) => {
    const newLinkedNodes = linkedNodes.filter(id => id !== nodeIdToRemove);
    setLinkedNodes(newLinkedNodes);
    handleDataChange({ linkedNodes: newLinkedNodes });
  };

  const getNodeLabel = (nodeId) => allNodes.find(n => n.id === nodeId)?.data.label || `گره ${nodeId}`;

  return (
    <div className="flashcard-container">
      <div className="flashcard-header">
        <strong>ویرایش گره</strong>
        <button onClick={onClose} className="flashcard-close-button">✕</button>
      </div>

      <div className="flashcard-section">
        <label>نام گره</label>
        <input value={label} onChange={handleLabelChange} placeholder="نام گره را وارد کنید" />
      </div>

      <div className="flashcard-section">
        <label>توضیحات</label>
        {descriptions.map((desc, index) => (
          <div key={desc.id} className="description-block">
            <textarea
              value={desc.text}
              onChange={(e) => handleDescriptionChange(desc.id, 'text', e.target.value)}
              placeholder={`توضیحات ${index + 1}`}
            />
            <input
              value={desc.link}
              onChange={(e) => handleDescriptionChange(desc.id, 'link', e.target.value)}
              placeholder="لینک منبع (اختیاری)"
            />
            <button onClick={() => removeDescription(desc.id)} className="remove-desc-button">حذف</button>
          </div>
        ))}
        <button onClick={addDescription} className="add-desc-button">افزودن توضیحات</button>
      </div>

      <div className="flashcard-section">
        <label>لینک به گره دیگر</label>
        <div className="link-controls">
          <select value={linkTarget} onChange={(e) => setLinkTarget(e.target.value)}>
            <option value="">یک گره را انتخاب کنید...</option>
            {linkOptions.map(node => (
              <option key={node.id} value={node.id}>{node.data.label}</option>
            ))}
          </select>
          <button onClick={handleAddLink} disabled={!linkTarget}>افزودن</button>
        </div>
        <div className="link-list">
          {linkedNodes.map(nodeId => (
            <div key={nodeId} className="link-item">
              <span>{getNodeLabel(nodeId)}</span>
              <button onClick={() => handleRemoveLink(nodeId)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
