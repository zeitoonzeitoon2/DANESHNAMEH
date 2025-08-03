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
import "reactflow/dist/style.css";
import Flashcard from "./Flashcard";
import "./styles.css";

const initialNodes = [
  {
    id: "1",
    position: { x: 200, y: 200 },
    data: { label: "گره ۱", title: "عنوان ۱", text: "توضیحات ۱", linkedNodes: [] },
  },
];

// خطای شما به دلیل نبودن این خط بود
const initialEdges = [];

const LOCAL_STORAGE_KEY = "react-flow-graph-data";

function FlowEditor() {
  const reactFlowWrapper = useRef(null);
  const { project, getViewport } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [cardPosition, setCardPosition] = useState({ left: 0, top: 0 });

  // --- توابع جدید برای ذخیره و بارگذاری ---

  const handleSave = useCallback(() => {
    const flowData = { nodes, edges };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(flowData));
    alert("نمودار با موفقیت ذخیره شد!"); // یا یک نوتیفیکیشن بهتر
  }, [nodes, edges]);

  const handleLoad = useCallback(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const flowData = JSON.parse(savedData);
      setNodes(flowData.nodes || []);
      setEdges(flowData.edges || []);
      console.log("داده‌های ذخیره شده با موفقیت بارگذاری شد.");
    }
  }, [setNodes, setEdges]);

  const handleExport = useCallback(() => {
    const flowData = { nodes, edges };
    const jsonString = JSON.stringify(flowData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "graph-submission.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // بارگذاری خودکار داده‌ها هنگام شروع برنامه
  useEffect(() => {
    handleLoad();
  }, [handleLoad]);


  // --- توابع قبلی ---

  const updateCardPosition = useCallback((node) => {
    if (!reactFlowWrapper.current || !node) return;
    const viewport = getViewport();
    const nodeScreenPos = {
      x: node.position.x * viewport.zoom + viewport.x,
      y: node.position.y * viewport.zoom + viewport.y,
    };
    setCardPosition({
      left: nodeScreenPos.x + (node.width || 150) * viewport.zoom + 15,
      top: nodeScreenPos.y,
    });
  }, [getViewport]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    updateCardPosition(node);
  }, [updateCardPosition]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
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
      position: { x: Math.random() * 400, y: Math.random() * 300 },
      data: { label: `گره ${id.slice(-2)}`, title: "", text: "", linkedNodes: [] },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const onMove = useCallback(() => {
      if(selectedNode) {
          updateCardPosition(selectedNode);
      }
  }, [selectedNode, updateCardPosition]);

  return (
    <div ref={reactFlowWrapper} style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div className="top-bar-controls">
        <button onClick={addNode} className="control-button add-node">افزودن گره</button>
        <button onClick={handleSave} className="control-button save">ذخیره</button>
        <button onClick={handleExport} className="control-button export">ارسال برای بررسی (Export)</button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onMove={onMove}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>

      {selectedNode && (
        <div
          style={{
            position: "absolute",
            top: cardPosition.top,
            left: cardPosition.left,
            zIndex: 10,
          }}
        >
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
