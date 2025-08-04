// src/FlowEditor.jsx
import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
} from "reactflow";
import { setDoc } from "firebase/firestore";
import { graphDocRef } from "./firebase";
import CustomNode from "./CustomNode";
import Flashcard from "./Flashcard";

// ثبت کردن نوع گره سفارشی - این مرحله بسیار مهم است
const nodeTypes = { custom: CustomNode };

function FlowEditor({ initialGraphData, onNavigateToArticle, onCreateArticle }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialGraphData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialGraphData.edges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await setDoc(graphDocRef, { nodes, edges });
      alert("نمودار با موفقیت ذخیره شد!");
    } catch (error) {
      console.error("Error saving graph: ", error);
      alert("خطا در ذخیره‌سازی نمودار!");
    } finally {
      setIsSaving(false);
    }
  }, [nodes, edges]);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep' }, eds)),
    [setEdges]
  );

  const updateNodeData = useCallback((id, newData) => {
    const newNodes = nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n));
    setNodes(newNodes);
    setSelectedNode((prev) => (prev && prev.id === id ? { ...prev, data: { ...prev.data, ...newData } } : prev));
  }, [nodes, setNodes]);

  const addNode = useCallback(() => {
    const id = String(Date.now());
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: 'custom',
        position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
        data: { label: "گره جدید", descriptions: [], linkedNodes: [] },
      },
    ]);
  }, [setNodes]);

  return (
    <div className="flow-editor-container">
      <div className="top-bar-controls">
        <button onClick={addNode} className="control-button add-node">افزودن گره</button>
        <button onClick={handleSave} className="control-button save" disabled={isSaving}>
          {isSaving ? 'در حال ذخیره...' : 'ذخیره نمودار'}
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
        nodeTypes={nodeTypes} // ثبت نوع گره
        fitView
        className="react-flow-canvas"
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
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
            onNavigateToArticle={onNavigateToArticle}
            onCreateArticle={onCreateArticle}
          />
        </div>
      )}
    </div>
  );
}

export default FlowEditor;
