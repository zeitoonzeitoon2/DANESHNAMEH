// src/App.jsx

import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  MiniMap,
  Background,
} from "reactflow";
import { onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

import "reactflow/dist/style.css";
import Flashcard from "./Flashcard";
import CustomNode from "./CustomNode";
import "./styles.css";

// --- Firebase Initialization ---
// db و auth را از فایل پیکربندی Firebase ایمپورت می کنیم.
import { db, auth } from './firebase';


// تعریف نوع گره سفارشی
const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [
  {
    id: "1",
    type: 'custom',
    position: { x: 250, y: 150 },
    data: { 
      label: "گره اصلی", 
      descriptions: [{ id: Date.now(), text: 'این یک توضیح است.', link: 'https://reactflow.dev' }],
      linkedNodes: [] 
    },
  },
];

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // --- State جدید برای مدیریت مقالات ---
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [editingArticleTitle, setEditingArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [isArticleSaving, setIsArticleSaving] = useState(false);

  const reactFlowWrapper = useRef(null);
  const { setViewport } = useReactFlow();

  // --- Firebase Authentication & Data Sync ---
  useEffect(() => {
    // 1. Initialise and Authenticate Firebase
    const initializeFirebase = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Firebase authentication failed:", error);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
        console.log("Firebase auth state changed. User ID:", user.uid);
      } else {
        setUserId(null);
        setIsAuthReady(true);
        console.log("Firebase auth state changed. No user logged in.");
      }
    });

    initializeFirebase();

    return () => unsubscribeAuth();
  }, []);

  // 2. Fetch data from Firestore after authentication is ready
  useEffect(() => {
    if (!isAuthReady) return;

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const docRef = doc(db, `artifacts/${appId}/public/graphData`);

    const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const flowData = doc.data();
        setNodes(flowData.nodes || initialNodes);
        setEdges(flowData.edges || []);
        console.log("Graph data loaded from Firestore.");
      } else {
        setNodes(initialNodes);
        setEdges([]);
        console.log("No existing document, using initial data.");
      }
      setIsDataLoaded(true);
    });

    return () => unsubscribeSnapshot();
  }, [isAuthReady, setNodes, setEdges]);

  // 3. Fetch article content when a link is clicked
  const fetchArticleContent = useCallback(async (articleId) => {
    if (!articleId) return;
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const articleDocRef = doc(db, `artifacts/${appId}/public/articles/${articleId}`);

    try {
      const articleDocSnap = await getDoc(articleDocRef);
      if (articleDocSnap.exists()) {
        setArticleContent(articleDocSnap.data().content);
      } else {
        setArticleContent('');
      }
    } catch (error) {
      console.error("Error fetching article content: ", error);
      setArticleContent('');
    }
  }, []);

  // --- Handlers for ReactFlow and Links ---

  const handleSave = useCallback(async () => {
    if (!isAuthReady) {
      console.error("Firebase is not ready. Cannot save.");
      return;
    }
    
    setIsSaving(true);
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const docRef = doc(db, `artifacts/${appId}/public/graphData`);
      const flowData = { nodes, edges };
      await setDoc(docRef, flowData);
      console.log("Graph saved to Firestore!");
    } catch (error) {
      console.error("Error saving graph: ", error);
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges, isAuthReady]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setEditingArticleId(null);
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#555' } }, eds)),
    [setEdges]
  );
  
  const updateNodeData = useCallback((id, newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...newData } } : n
      )
    );
    setSelectedNode(prev => prev && prev.id === id ? {...prev, data: {...prev.data, ...newData}} : prev);
  }, [setNodes]);

  const addNode = useCallback(() => {
    const id = String(Date.now());
    const newNode = {
      id,
      type: 'custom',
      position: {
        x: Math.random() * 400,
        y: Math.random() * 300,
      },
      data: {
        label: "گره جدید",
        descriptions: [{ id: Date.now(), text: '', link: '' }],
        linkedNodes: [],
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const handleLinkClick = useCallback((linkId, linkTitle) => {
    setEditingArticleId(linkId);
    setEditingArticleTitle(linkTitle);
    fetchArticleContent(linkId);
  }, [fetchArticleContent]);

  const handleArticleSave = useCallback(async () => {
    if (!isAuthReady || !editingArticleId) return;

    setIsArticleSaving(true);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const articleDocRef = doc(db, `artifacts/${appId}/public/articles/${editingArticleId}`);

    try {
      await setDoc(articleDocRef, { content: articleContent, title: editingArticleTitle }, { merge: true });
      console.log("Article saved successfully!");
    } catch (error) {
      console.error("Error saving article: ", error);
    } finally {
      setIsArticleSaving(false);
    }
  }, [isAuthReady, editingArticleId, articleContent, editingArticleTitle]);

  const handleCloseArticle = useCallback(() => {
    setEditingArticleId(null);
    setEditingArticleTitle('');
    setArticleContent('');
  }, []);

  if (!isAuthReady || !isDataLoaded) {
    return <div className="loading-screen">در حال بارگذاری نمودار...</div>;
  }

  // --- رندر کردن صفحه ویرایش مقاله در صورت وجود editingArticleId ---
  if (editingArticleId) {
    return (
      <div className="article-editor-container bg-slate-900 text-gray-200 p-8 h-screen flex flex-col items-center">
        <div className="w-full max-w-4xl p-6 bg-slate-800 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-blue-400">{editingArticleTitle}</h2>
            <button
              onClick={handleCloseArticle}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200"
            >
              بستن
            </button>
          </div>
          <textarea
            className="w-full h-96 p-4 text-lg bg-slate-700 text-gray-200 border-2 border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
            value={articleContent}
            onChange={(e) => setArticleContent(e.target.value)}
            placeholder="محتوای مقاله را اینجا وارد کنید..."
          ></textarea>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleArticleSave}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200"
              disabled={isArticleSaving}
            >
              {isArticleSaving ? 'در حال ذخیره...' : 'ذخیره مقاله'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- رندر کردن نمودار در حالت عادی ---
  return (
    <div ref={reactFlowWrapper} style={{ width: "100vw", height: "100vh" }}>
      <div className="top-bar-controls">
        <button onClick={addNode} className="control-button add-node">افزودن گره</button>
        <button onClick={handleSave} className="control-button save" disabled={isSaving}>
          {isSaving ? 'در حال ذخیره...' : 'ذخیره در سرور'}
        </button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
        <Background />
      </ReactFlow>

      {selectedNode && (
        <div className="flashcard-panel">
          <Flashcard
            key={selectedNode.id}
            data={selectedNode.data}
            onChange={(data) => updateNodeData(selectedNode.id, data)}
            onClose={onPaneClick}
            allNodes={nodes}
            currentNodeId={selectedNode.id}
            onLinkClick={handleLinkClick} // پراپ جدید
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}
