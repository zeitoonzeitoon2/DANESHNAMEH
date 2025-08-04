// src/App.jsx
import React, { useState, useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { onSnapshot, setDoc, collection, addDoc } from "firebase/firestore";
import { db, graphDocRef, articlesCollectionRef } from "./firebase"; // ایمپورت متغیرهای firestore
import FlowEditor from "./FlowEditor";
import ArticlePage from "./ArticlePage";
import "./styles.css";

export default function App() {
  const [view, setView] = useState({ name: 'graph', articleId: null });
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(graphDocRef, (doc) => {
      if (doc.exists() && doc.data().nodes) {
        setGraphData(doc.data());
      } else {
        const initialData = {
          nodes: [{
            id: "1", type: 'custom', position: { x: 250, y: 150 },
            data: { label: "گره اصلی", descriptions: [{ id: Date.now(), text: 'این یک توضیح است.', link: null }], linkedNodes: [] }
          }],
          edges: []
        };
        setDoc(graphDocRef, initialData); // ساخت داکیومنت اولیه اگر وجود نداشت
        setGraphData(initialData);
      }
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const handleNavigateToArticle = (articleId) => {
    setView({ name: 'article', articleId });
  };

  const handleNavigateToGraph = () => {
    setView({ name: 'graph', articleId: null });
  };

  const handleCreateArticle = async () => {
    try {
      const newArticle = {
        title: "مقاله بدون عنوان",
        content: "# عنوان مقاله \n\n محتوای خود را اینجا بنویسید...",
        createdAt: new Date(),
      };
      const docRef = await addDoc(articlesCollectionRef, newArticle);
      return docRef.id;
    } catch (error) {
      console.error("Error creating new article:", error);
      return null;
    }
  };

  if (!isLoaded) {
    return <div className="loading-screen">در حال بارگذاری داده‌ها از سرور...</div>;
  }

  return (
    <ReactFlowProvider>
      {view.name === 'graph' ? (
        <FlowEditor
          initialGraphData={graphData}
          onNavigateToArticle={handleNavigateToArticle}
          onCreateArticle={handleCreateArticle}
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
