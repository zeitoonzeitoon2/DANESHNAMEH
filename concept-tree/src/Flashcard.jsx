// src/Flashcard.jsx
import React, { useState, useMemo } from "react";

export default function Flashcard({ data, onChange, onClose, allNodes, currentNodeId, onNavigateToArticle, onCreateArticle }) {
  const [label, setLabel] = useState(data.label || "");
  const [descriptions, setDescriptions] = useState(data.descriptions || []);
  // ... (سایر state ها مثل قبل باقی می‌مانند)

  const handleDataChange = (newData) => {
    onChange({ label, descriptions, linkedNodes: data.linkedNodes, ...newData });
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
    const newDescriptions = [...descriptions, { id: Date.now(), text: '', link: null }]; // link is now articleId
    setDescriptions(newDescriptions);
    handleDataChange({ descriptions: newDescriptions });
  };

  const removeDescription = (id) => {
    const newDescriptions = descriptions.filter(desc => desc.id !== id);
    setDescriptions(newDescriptions);
    handleDataChange({ descriptions: newDescriptions });
  };
  
  // تابع جدید برای مدیریت لینک مقاله
  const handleArticleLink = async (descId) => {
    const desc = descriptions.find(d => d.id === descId);
    if (desc.link) {
      // اگر لینک (articleId) وجود داشت، به آن صفحه برو
      onNavigateToArticle(desc.link);
    } else {
      // اگر وجود نداشت، یک مقاله جدید بساز
      const newArticleId = await onCreateArticle();
      if (newArticleId) {
        // شناسه مقاله جدید را در توضیحات ذخیره کن
        handleDescriptionChange(descId, 'link', newArticleId);
        // و به صفحه آن برو
        onNavigateToArticle(newArticleId);
      }
    }
  };

  // ... (بقیه توابع مثل قبل)

  return (
    <div className="flashcard-container">
      <div className="flashcard-header">
        <strong>ویرایش گره</strong>
        <button onClick={onClose} className="flashcard-close-button">✕</button>
      </div>

      <div className="flashcard-section">
        <label>نام گره</label>
        <input value={label} onChange={handleLabelChange} />
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
            {/* دکمه جدید برای مدیریت مقاله */}
            <div className="description-toolbar">
                <button className="article-link-button" onClick={() => handleArticleLink(desc.id)}>
                  {desc.link ? 'مشاهده/ویرایش مقاله' : 'ایجاد مقاله مرجع'}
                </button>
                <button onClick={() => removeDescription(desc.id)} className="remove-desc-button">حذف</button>
            </div>
          </div>
        ))}
        <button onClick={addDescription} className="add-desc-button">افزودن توضیحات</button>
      </div>
      {/* بخش لینک به گره دیگر بدون تغییر باقی می‌ماند */}
    </div>
  );
}
