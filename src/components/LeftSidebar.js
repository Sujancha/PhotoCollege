import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { generateId } from '../utils';

function PhotoThumb({ photo, index, onRemove, onDragStart, onDrop, accentColor, isAssigned, onClick }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => { setDragging(true); onDragStart(index); e.dataTransfer.setData('photoId', photo.id); }}
      onDragEnd={() => setDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onDrop(index); }}
      onClick={() => onClick(photo)}
      style={{
        position: 'relative',
        cursor: 'grab',
        opacity: dragging ? 0.4 : 1,
        borderRadius: 2,
        overflow: 'hidden',
        border: isAssigned ? `1px solid ${accentColor}` : '1px solid #2A2A2A',
        background: '#111',
      }}
    >
      <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#0A0A0A' }}>
        <img
          src={photo.url}
          alt={photo.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: photo.flipH ? 'scaleX(-1)' : 'none',
            display: 'block',
          }}
        />
      </div>
      <div style={{ padding: '4px 6px', background: '#111' }}>
        <div style={{ fontSize: 9, color: '#555', fontFamily: 'DM Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {photo.name}
        </div>
        {photo.w && (
          <div style={{ fontSize: 8, color: '#333', fontFamily: 'DM Mono, monospace' }}>
            {photo.w}×{photo.h}
          </div>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(photo.id); }}
        style={{
          position: 'absolute', top: 3, right: 3,
          background: 'rgba(0,0,0,0.7)',
          border: 'none', cursor: 'pointer', color: '#888',
          width: 16, height: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 2,
        }}
      >
        <X size={10} />
      </button>
    </div>
  );
}

export default function LeftSidebar({ photos, onPhotosAdded, onReorder, onRemove, onAssignToZone, selectedZone, accentColor, currentSlide }) {
  const fileInput = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [dragFromIdx, setDragFromIdx] = useState(null);

  const processFiles = useCallback((files) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const newPhotos = [];
    let pending = 0;

    Array.from(files).forEach(file => {
      if (!validTypes.includes(file.type)) return;
      pending++;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        newPhotos.push({ id: generateId(), url, name: file.name, w: img.naturalWidth, h: img.naturalHeight, flipH: false });
        pending--;
        if (pending === 0) onPhotosAdded(newPhotos);
      };
      img.onerror = () => { pending--; if (pending === 0) onPhotosAdded(newPhotos); };
      img.src = url;
    });
  }, [onPhotosAdded]);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleClick = useCallback((photo) => {
    if (selectedZone) {
      onAssignToZone(selectedZone, photo.id);
    }
  }, [selectedZone, onAssignToZone]);

  const assignedIds = new Set(Object.values(currentSlide?.photoAssignments || {}));

  return (
    <div className="flex flex-col flex-shrink-0" style={{ width: 220, background: '#1A1A1A', borderRight: '1px solid #2A2A2A', overflow: 'hidden' }}>
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid #2A2A2A' }}>
        <span style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Photos ({photos.length}/20)
        </span>
      </div>

      {/* Upload zone */}
      <div
        className={`mx-3 my-2 flex flex-col items-center justify-center cursor-pointer transition-all rounded`}
        style={{
          border: `1px dashed ${dragOver ? accentColor : '#333'}`,
          background: dragOver ? `rgba(${accentColor === '#C9A96E' ? '201,169,110' : '0,168,255'},0.04)` : 'transparent',
          padding: '10px 8px',
          minHeight: 64,
        }}
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
      >
        <Upload size={14} style={{ color: dragOver ? accentColor : '#444', marginBottom: 4 }} />
        <span style={{ fontSize: 10, color: '#555', fontFamily: 'DM Sans, sans-serif', textAlign: 'center', lineHeight: 1.4 }}>
          Drop photos or click to upload
        </span>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={e => processFiles(e.target.files)}
        />
      </div>

      {/* Selected zone hint */}
      {selectedZone && (
        <div className="mx-3 mb-2 px-2 py-1.5 rounded text-xs text-center"
          style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}55`, color: accentColor, fontFamily: 'DM Sans, sans-serif', fontSize: 10 }}>
          Click a photo to assign to {selectedZone}
        </div>
      )}

      {/* Photo grid */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <ImageIcon size={24} style={{ color: '#333' }} />
            <span style={{ fontSize: 10, color: '#444', fontFamily: 'DM Sans, sans-serif', textAlign: 'center' }}>
              No photos yet
            </span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {photos.map((photo, i) => (
              <PhotoThumb
                key={photo.id}
                photo={photo}
                index={i}
                onRemove={onRemove}
                onDragStart={setDragFromIdx}
                onDrop={(toIdx) => { if (dragFromIdx !== null) onReorder(dragFromIdx, toIdx); setDragFromIdx(null); }}
                accentColor={accentColor}
                isAssigned={assignedIds.has(photo.id)}
                onClick={handleClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
