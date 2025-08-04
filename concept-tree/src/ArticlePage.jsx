// src/ArticlePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import ReactMarkdown from 'react-markdown'; // برای نمایش زیبای متن

function ArticlePage({ articleId, onBack }) {
  const [article, setArticle] = useState(null);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const articleRef = doc(db, 'articles', articleId);

  useEffect(() => {
    const fetchArticle = async () => {
      const docSnap = await getDoc(articleRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setArticle(data);
        setContent(data.content);
      } else {
        console.error("No such article!");
      }
    };
    fetchArticle();
  }, [articleId, articleRef]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(articleRef, { ...article, content }, { merge: true });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving article:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!article) {
    return <div className="loading-screen">در حال بارگذاری مقاله...</div>;
  }

  return (
    <div className="article-page-container">
      <div className="article-toolbar">
        <button onClick={onBack}>&larr; بازگشت به نمودار</button>
        <div>
          {isEditing && (
            <button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
            </button>
          )}
          <button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'لغو ویرایش' : 'ویرایش مقاله'}
          </button>
        </div>
      </div>
      <div className="article-content">
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="article-editor"
          />
        ) : (
          <ReactMarkdown className="markdown-preview">{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default ArticlePage;
