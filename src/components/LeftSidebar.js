import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { generateId } from '../utils';
import { MAX_PHOTOS } from '../constants';

function PhotoThumb({ photo, index, zoneLabel, onRemove, onDragStart, onDrop, accentColor, onClick, isInSelectedZone, isAssigned }) {
  const [dragging, setDragging] = useState(false);
  const [dropOver, setDropOver] = useState(false);

  const borderColor = dropOver
    ? accentColor
    : isInSelectedZone
      ? accentColor
      : isAssigned
        ? accentColor + '55'
        : '#2A2A2A';

  return (
    <div
      draggable
      onDragStart={(e) => {
        setDragging(true);
        onDragStart(index);
        e.dataTransfer.setData('photoId', photo.id);
        e.dataTransfer.setData('sourceType', 'library');
      }}
      onDragEnd={() => setDragging(false)}
      onDragOver={(e) => { e.preventDefault(); setDropOver(true); }}
      onDragLeave={() => setDropOver(false)}
      onDrop={(e) => { e.preventDefault(); setDropOver(false); onDrop(index); }}
      onClick={() => onClick(photo)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        opacity: dragging ? 0.3 : 1,
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        background: '#111',
        boxShadow: dropOver ? `0 0 0 2px ${accentColor}44` : isInSelectedZone ? `0 0 0 2px ${accentColor}33` : 'none',
        transition: 'border-color 120ms, box-shadow 120ms',
      }}
    >
      <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#0A0A0A', position: 'relative' }}>
        <img
          src={photo.url}
          alt={photo.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />

        {/* Photo number badge — top left */}
        <div style={{
          position: 'absolute', top: 3, left: 3,
          background: 'rgba(0,0,0,0.72)', color: '#888',
          fontSize: 8, fontFamily: 'DM Mono, monospace',
          fontWeight: 700, padding: '1px 4px', borderRadius: 2,
          lineHeight: 1.4,
        }}>
          {index + 1}
        </div>

        {/* Zone badge — bottom left (which canvas slot this photo is in) */}
        {zoneLabel && (
          <div style={{
            position: 'absolute', bottom: 3, left: 3,
            background: accentColor, color: '#000',
            fontSize: 8, fontFamily: 'DM Mono, monospace',
            fontWeight: 700, padding: '1px 4px', borderRadius: 2,
            lineHeight: 1.4,
          }}>
            {zoneLabel}
          </div>
        )}
      </div>
      <div style={{ padding: '3px 5px', background: '#0E0E0E' }}>
        <div style={{ fontSize: 8, color: '#444', fontFamily: 'DM Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {photo.name.replace(/\.[^.]+$/, '')}
        </div>
      </div>
      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(photo.id); }}
        style={{
          position: 'absolute', top: 3, right: 3,
          background: 'rgba(0,0,0,0.75)', border: 'none', cursor: 'pointer', color: '#777',
          width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 2, fontSize: 10, lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default function LeftSidebar({ photos, onPhotosAdded, onReorder, onRemove, onAssignToZone, onUnassignFromZone, selectedZone, accentColor, currentSlide }) {
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
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  // Build maps: photoId → zoneKey, photoId → zone label
  const assignments = useMemo(() => currentSlide?.photoAssignments || {}, [currentSlide?.photoAssignments]);
  const { photoZoneMap, photoZoneKey } = useMemo(() => {
    const map = {};   // photoId → "Z1"
    const key = {};   // photoId → "zone-0"
    Object.entries(assignments).forEach(([zoneKey, photoId]) => {
      const idx = parseInt(zoneKey.replace('zone-', ''), 10);
      map[photoId] = `Z${idx + 1}`;
      key[photoId] = zoneKey;
    });
    return { photoZoneMap: map, photoZoneKey: key };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide?.photoAssignments]);

  const handleClick = useCallback((photo) => {
    const assignedZone = photoZoneKey[photo.id];

    if (selectedZone) {
      if (assignments[selectedZone] === photo.id) {
        // Photo is already in the selected zone → unassign it
        onUnassignFromZone(selectedZone);
      } else {
        // Assign to selected zone
        onAssignToZone(selectedZone, photo.id);
      }
    } else if (assignedZone) {
      // No zone selected but photo is in a zone → unassign
      onUnassignFromZone(assignedZone);
    }
  }, [selectedZone, assignments, photoZoneKey, onAssignToZone, onUnassignFromZone]);

  const zoneNumber = selectedZone ? parseInt(selectedZone.replace('zone-', ''), 10) + 1 : null;

  return (
    <div className="flex flex-col flex-shrink-0" style={{ width: 220, background: '#141414', borderRight: '1px solid #222', overflow: 'hidden' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid #222' }}>
        <span style={{ fontSize: 10, fontFamily: 'DM Sans, sans-serif', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Media Pool
        </span>
        <span style={{ fontSize: 9, color: '#444', fontFamily: 'DM Mono, monospace' }}>
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      {/* Upload zone */}
      <div
        style={{
          margin: '8px 10px',
          border: `1px dashed ${dragOver ? accentColor : '#2A2A2A'}`,
          background: dragOver ? `${accentColor}08` : 'transparent',
          borderRadius: 2,
          padding: '10px 8px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', gap: 4, transition: 'all 150ms',
        }}
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleFileDrop}
      >
        <Upload size={13} style={{ color: dragOver ? accentColor : '#3A3A3A' }} />
        <span style={{ fontSize: 10, color: '#3A3A3A', fontFamily: 'DM Sans, sans-serif', textAlign: 'center', lineHeight: 1.3 }}>
          Drop or click to import
        </span>
        <input ref={fileInput} type="file" multiple accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }} onChange={e => processFiles(e.target.files)} />
      </div>

      {/* Instruction */}
      {photos.length > 0 && (
        <div style={{ padding: '0 10px 6px', fontSize: 9, color: '#3A3A3A', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>
          {selectedZone
            ? <span style={{ color: accentColor }}>Zone {zoneNumber} selected — click a photo to place it</span>
            : 'Click a canvas zone, then click a photo to assign. Click an assigned photo to remove it.'}
        </div>
      )}

      {/* Photo grid */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '0 8px 8px' }}>
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <ImageIcon size={22} style={{ color: '#2A2A2A' }} />
            <span style={{ fontSize: 10, color: '#3A3A3A', fontFamily: 'DM Sans, sans-serif', textAlign: 'center', lineHeight: 1.4 }}>
              No photos yet.<br />Import to get started.
            </span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
            {photos.map((photo, i) => (
              <PhotoThumb
                key={photo.id}
                photo={photo}
                index={i}
                zoneLabel={photoZoneMap[photo.id] || null}
                onRemove={onRemove}
                onDragStart={setDragFromIdx}
                onDrop={(toIdx) => { if (dragFromIdx !== null && dragFromIdx !== toIdx) onReorder(dragFromIdx, toIdx); setDragFromIdx(null); }}
                accentColor={accentColor}
                isInSelectedZone={!!selectedZone && assignments[selectedZone] === photo.id}
                isAssigned={!!photoZoneMap[photo.id]}
                onClick={handleClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
