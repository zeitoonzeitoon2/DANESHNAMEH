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
import { onSnapshot, doc, setDoc } from "firebase/firestore";
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

    // شناسه داکیومنتی که داده‌ها در آن ذخیره می‌شود
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    // Path for public and shared data storage
    const docRef = doc(db, `artifacts/${appId}/public/graphs/graphData`);

    const unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const flowData = doc.data();
        setNodes(flowData.nodes || initialNodes);
        setEdges(flowData.edges || []);
        console.log("Graph data loaded from Firestore.");
      } else {
        // اگر داکیومنتی وجود نداشت، از داده‌های اولیه استفاده کن
        setNodes(initialNodes);
        setEdges([]);
        console.log("No existing document, using initial data.");
      }
      setIsDataLoaded(true);
    });

    // پاکسازی شنود هنگام خروج از کامپوننت
    return () => unsubscribeSnapshot();
  }, [isAuthReady, setNodes, setEdges]);

  const handleSave = useCallback(async () => {
    if (!isAuthReady) {
      console.error("Firebase is not ready. Cannot save.");
      return;
    }
    
    setIsSaving(true);
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const docRef = doc(db, `artifacts/${appId}/public/graphs/graphData`);
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

  if (!isAuthReady || !isDataLoaded) {
    return <div className="loading-screen">در حال بارگذاری نمودار...</div>;
  }

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
