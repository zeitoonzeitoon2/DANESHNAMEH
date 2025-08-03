// src/Flashcard.jsx
import React, { useState, useEffect, useMemo } from "react";

export default function Flashcard({ data, onChange, onClose, allNodes, currentNodeId }) {
  const [title, setTitle] = useState(data.title || "");
  const [text, setText] = useState(data.text || "");
  const [linkedNodes, setLinkedNodes] = useState(data.linkedNodes || []);
  const [linkTarget, setLinkTarget] = useState(""); // State برای نگهداری مقدار dropdown

  // وقتی کاربر در حال تایپ است، داده‌های اصلی را آپدیت نکن
  const handleBlur = () => {
    onChange({ title, text, linkedNodes });
  };

  // گزینه‌های موجود برای لینک دادن (همه گره‌ها بجز گره فعلی و گره‌هایی که قبلا لینک شده‌اند)
  const linkOptions = useMemo(() => {
    const existingLinks = new Set(linkedNodes);
    return allNodes.filter(node => node.id !== currentNodeId && !existingLinks.has(node.id));
  }, [allNodes, currentNodeId, linkedNodes]);

  const handleAddLink = () => {
    if (linkTarget && !linkedNodes.includes(linkTarget)) {
      const newLinkedNodes = [...linkedNodes, linkTarget];
      setLinkedNodes(newLinkedNodes);
      onChange({ title, text, linkedNodes: newLinkedNodes }); // بلافاصله آپدیت کن
      setLinkTarget(""); // dropdown را ریست کن
    }
  };

  const handleRemoveLink = (nodeIdToRemove) => {
    const newLinkedNodes = linkedNodes.filter(id => id !== nodeIdToRemove);
    setLinkedNodes(newLinkedNodes);
    onChange({ title, text, linkedNodes: newLinkedNodes }); // بلافاصله آپدیت کن
  };

  // تابعی برای پیدا کردن لیبل یک گره از روی شناسه آن
  const getNodeLabel = (nodeId) => {
    const node = allNodes.find(n => n.id === nodeId);
    return node ? node.data.label : `گره ${nodeId}`;
  };

  return (
    <div className="flashcard-container">
      <div className="flashcard-header">
        <strong>فلش‌کارت</strong>
        <button onClick={onClose} className="flashcard-close-button">✕</button>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
        placeholder="عنوان"
        className="flashcard-input"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="توضیحات"
        className="flashcard-textarea"
      />

      {/* بخش جدید برای مدیریت لینک‌ها */}
      <div className="link-section">
        <strong>لینک به گره دیگر:</strong>
        <div className="link-controls">
          <select
            value={linkTarget}
            onChange={(e) => setLinkTarget(e.target.value)}
            className="link-select"
          >
            <option value="">یک گره را انتخاب کنید...</option>
            {linkOptions.map(node => (
              <option key={node.id} value={node.id}>
                {node.data.label}
              </option>
            ))}
          </select>
          <button onClick={handleAddLink} className="link-add-button" disabled={!linkTarget}>
            افزودن
          </button>
        </div>

        {/* نمایش لیست لینک‌های فعلی */}
        {linkedNodes.length > 0 && (
          <div className="link-list">
            {linkedNodes.map(nodeId => (
              <div key={nodeId} className="link-item">
                <span>{getNodeLabel(nodeId)}</span>
                <button onClick={() => handleRemoveLink(nodeId)} className="link-remove-button">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
