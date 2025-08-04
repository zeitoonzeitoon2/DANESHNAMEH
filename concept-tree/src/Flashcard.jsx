// src/Flashcard.jsx
import React, { useState, useMemo } from "react";

export default function Flashcard({ data, onChange, onClose, allNodes, currentNodeId, onNavigateToArticle, onCreateArticle }) {
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
    const newDescriptions = descriptions.map(desc => desc.id === id ? { ...desc, [field]: value } : desc);
    setDescriptions(newDescriptions);
    handleDataChange({ descriptions: newDescriptions });
  };

  const addDescription = () => {
    const newDescriptions = [...descriptions, { id: Date.now(), text: '', link: null }];
    setDescriptions(newDescriptions);
    handleDataChange({ descriptions: newDescriptions });
  };

  const removeDescription = (id) => {
    const newDescriptions = descriptions.filter(desc => desc.id !== id);
    setDescriptions(newDescriptions);
    handleDataChange({ descriptions: newDescriptions });
  };
  
  const handleArticleLink = async (descId) => {
    const desc = descriptions.find(d => d.id === descId);
    if (desc.link) {
      onNavigateToArticle(desc.link);
    } else {
      const newArticleId = await onCreateArticle();
      if (newArticleId) {
        handleDescriptionChange(descId, 'link', newArticleId);
        onNavigateToArticle(newArticleId);
      }
    }
  };

  const getNodeLabel = (nodeId) => allNodes.find(n => n.id === nodeId)?.data.label || `گره ${nodeId}`;

  // بقیه توابع لینک به گره دیگر مثل قبل هستند و نیازی به تغییر ندارند

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
              rows={3}
            />
            <div className="description-toolbar">
                <button className="article-link-button" onClick={() => handleArticleLink(desc.id)}>
                  {desc.link ? 'مشاهده / ویرایش مقاله مرجع' : 'ایجاد مقاله مرجع'}
                </button>
                <button onClick={() => removeDescription(desc.id)} className="remove-desc-button" title="حذف این توضیحات">✕</button>
            </div>
          </div>
        ))}
        <button onClick={addDescription} className="add-desc-button">+ افزودن توضیحات</button>
      </div>
      
      {/* بخش لینک به گره دیگر */}
    </div>
  );
}
