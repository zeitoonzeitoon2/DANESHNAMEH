// src/App.jsx
import React, { useState, useCallback, useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { getFirestore, doc, onSnapshot, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "./firebase"; // ایمپورت از فایل firebase.js
import FlowEditor from "./FlowEditor"; // کامپوننت ویرایشگر نمودار
import ArticlePage from "./ArticlePage"; // کامپوننت جدید برای مقالات
import "./styles.css";

// شناسه داکیومنتی که داده‌های نمودار در آن ذخیره می‌شود
const graphDocId = typeof __app_id !== 'undefined' ? __app_id : 'default-graph';
const graphDocRef = doc(db, "graphs", graphDocId);
const articlesCollectionRef = collection(db, "articles");

export default function App() {
  // State برای مدیریت نمای فعلی (نمودار یا مقاله)
  const [view, setView] = useState({ name: 'graph', articleId: null });
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  // شنود برای دریافت داده‌های نمودار از فایربیس
  useEffect(() => {
    const unsubscribe = onSnapshot(graphDocRef, (doc) => {
      if (doc.exists()) {
        setGraphData(doc.data());
      } else {
        // اگر داکیومenti وجود نداشت، یک نمودار اولیه ایجاد و ذخیره کن
        const initialData = {
          nodes: [{
            id: "1", type: 'custom', position: { x: 250, y: 150 },
            data: { label: "گره اصلی", descriptions: [], linkedNodes: [] }
          }],
          edges: []
        };
        setDoc(graphDocRef, initialData);
        setGraphData(initialData);
      }
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // تابع برای ناوبری به صفحه یک مقاله
  const handleNavigateToArticle = (articleId) => {
    setView({ name: 'article', articleId });
  };

  // تابع برای بازگشت به ویرایشگر نمودار
  const handleNavigateToGraph = () => {
    setView({ name: 'graph', articleId: null });
  };

  // تابع برای ایجاد یک مقاله جدید
  const handleCreateArticle = async () => {
    try {
      const newArticle = {
        title: "مقاله بدون عنوان",
        content: "# عنوان مقاله \n\n اینجا بنویسید...",
        createdAt: new Date(),
      };
      const docRef = await addDoc(articlesCollectionRef, newArticle);
      return docRef.id; // شناسه مقاله جدید را برگردان
    } catch (error) {
      console.error("Error creating new article:", error);
      return null;
    }
  };

  if (!isLoaded) {
    return <div className="loading-screen">در حال بارگذاری...</div>;
  }

  // رندر کردن کامپوننت مناسب بر اساس نمای فعلی
  return (
    <ReactFlowProvider>
      {view.name === 'graph' ? (
        <FlowEditor
          initialNodes={graphData.nodes}
          initialEdges={graphData.edges}
          onNavigateToArticle={handleNavigateToArticle}
          onCreateArticle={handleCreateArticle}
          graphDocRef={graphDocRef}
        />
      ) : (
        <ArticlePage
          articleId={view.articleId}
          onBack={handleNavigateToGraph}
        />
      )}
    </ReactFlowProvider>
  );
}
