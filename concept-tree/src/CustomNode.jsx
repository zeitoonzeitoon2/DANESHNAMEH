// src/CustomNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

// استفاده از memo برای بهینه‌سازی و جلوگیری از رندرهای غیرضروری
export default memo(({ data, isConnectable }) => {
  return (
    <>
      {/* دستگیره ورودی (Target) در سمت راست برای چیدمان راست به چپ */}
      <Handle
        type="target"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />
      
      {/* بدنه اصلی گره */}
      <div className="custom-node-body">
        {data.label}
      </div>

      {/* دستگیره خروجی (Source) در سمت چپ برای چیدمان راست به چپ */}
      <Handle
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: '#555' }}
      />
    </>
  );
});
