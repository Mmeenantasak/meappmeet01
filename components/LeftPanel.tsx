
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Participant } from '../types';
import Modal from './Modal';
import Sortable from 'sortablejs';

interface LeftPanelProps {
  participants: Participant[];
  setParticipants: (participants: Participant[]) => void;
  columns: number;
  setColumns: (columns: number) => void;
  onParticipantClick: (name: string) => void;
  transcript: string;
  setTranscript: (transcript: string) => void;
  onTimestampClick: (timestamp: string) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  participants,
  setParticipants,
  columns,
  setColumns,
  onParticipantClick,
  transcript,
  setTranscript,
  onTimestampClick,
}) => {
  const [modal, setModal] = useState<
    'add' | 'rename' | 'delete' | 'action-items' | null
  >(null);
  const [currentTarget, setCurrentTarget] = useState<Participant | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [actionItems, setActionItems] = useState<string[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const sortableInstance = useRef<Sortable | null>(null);

  useEffect(() => {
    if (gridRef.current) {
      if (sortableInstance.current) {
        sortableInstance.current.destroy();
      }
      sortableInstance.current = Sortable.create(gridRef.current, {
        animation: 150,
        ghostClass: 'opacity-50',
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            const newParticipants = Array.from(participants);
            const [movedItem] = newParticipants.splice(evt.oldIndex, 1);
            newParticipants.splice(evt.newIndex, 0, movedItem);
            setParticipants(newParticipants);
          }
        },
      });
    }
  }, [participants, setParticipants]);

  const handleAdd = () => {
    setInputValue('');
    setModal('add');
  };

  const handleRename = (participant: Participant) => {
    setCurrentTarget(participant);
    setInputValue(participant.name);
    setModal('rename');
  };

  const handleDelete = (participant: Participant) => {
    setCurrentTarget(participant);
    setModal('delete');
  };

  const confirmAdd = () => {
    if (inputValue.trim()) {
      const newParticipant: Participant = {
        id: Date.now().toString(),
        name: inputValue.trim(),
      };
      setParticipants([...participants, newParticipant]);
      closeModal();
    }
  };

  const confirmRename = () => {
    if (currentTarget && inputValue.trim()) {
      setParticipants(
        participants.map((p) =>
          p.id === currentTarget.id ? { ...p, name: inputValue.trim() } : p
        )
      );
      closeModal();
    }
  };

  const confirmDelete = () => {
    if (currentTarget) {
      setParticipants(participants.filter((p) => p.id !== currentTarget.id));
      closeModal();
    }
  };
  
  const closeModal = () => {
    setModal(null);
    setCurrentTarget(null);
    setInputValue('');
  };

  const showActionItems = () => {
    const keywords = ['มอบหมาย', 'ต้องทำ', 'ติดตาม', 'to-do', 'action item'];
    const lines = transcript.split('\n');
    const items = lines.filter(line => keywords.some(kw => line.toLowerCase().includes(kw)));
    setActionItems(items);
    setModal('action-items');
  };

  const formatText = () => {
      let newText = transcript;
      newText = newText.replace(/ครับ|ค่ะ/g, '');
      newText = newText.replace(/[0-9]/g, d => '๐๑๒๓๔๕๖๗๘๙'[parseInt(d)]);
      newText = newText.replace(/ยังไง/g, 'อย่างไร');
      setTranscript(newText.trim());
  };

  const downloadDoc = () => {
      const content = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>Meeting Notes</title></head>
          <body>${transcript.replace(/\n/g, '<br />')}</body>
          </html>
      `;
      const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(content);
      const downloadLink = document.createElement("a");
      document.body.appendChild(downloadLink);
      downloadLink.href = url;
      downloadLink.download = 'meeting-notes.doc';
      downloadLink.click();
      document.body.removeChild(downloadLink);
  };
  
  const copyAll = () => {
      navigator.clipboard.writeText(transcript).then(() => {
          alert("Copied to clipboard!");
      }).catch(err => {
          console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Participants Section */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">ผู้เข้าร่วม</h2>
          <div className="flex items-center space-x-1">
            <button onClick={() => setColumns(Math.max(1, columns - 1))} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">-</button>
            <span className="font-mono text-sm">{columns}</span>
            <button onClick={() => setColumns(Math.min(6, columns + 1))} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">+</button>
          </div>
        </div>
        <div
          ref={gridRef}
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {participants.map((p) => (
            <div
              key={p.id}
              className="group relative bg-white dark:bg-gray-800 p-2 rounded-lg shadow cursor-pointer text-center truncate"
            >
              <span onClick={() => onParticipantClick(p.name)}>{p.name}</span>
              <div className="absolute top-0 right-0 flex opacity-0 group-hover:opacity-100 transition-opacity bg-gray-200 dark:bg-gray-600 rounded-bl-lg rounded-tr-md text-xs">
                <button onClick={() => handleRename(p)} className="p-1 hover:text-blue-500">✏️</button>
                <button onClick={() => handleDelete(p)} className="p-1 hover:text-red-500">🗑️</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleAdd} className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
          เพิ่มผู้เข้าร่วม
        </button>
      </div>

      {/* Tools Section */}
      <div className="flex-shrink-0">
        <h2 className="text-xl font-semibold mb-2">เครื่องมือ</h2>
        <div className="grid grid-cols-2 gap-2">
            <button onClick={showActionItems} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">สรุป Action Items</button>
            <button onClick={() => onTimestampClick(`[${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}]`)} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">แทรกเวลา</button>
            <button onClick={formatText} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">จัดรูปแบบ</button>
            <button onClick={copyAll} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">คัดลอกทั้งหมด</button>
            <button onClick={downloadDoc} className="p-2 col-span-2 bg-green-500 text-white rounded-lg hover:bg-green-600">ดาวน์โหลด (.doc)</button>
        </div>
      </div>
      
      {/* Modals */}
      {modal === 'add' && (
        <Modal title="เพิ่มผู้เข้าร่วม" onClose={closeModal} onConfirm={confirmAdd}>
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} autoFocus className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
        </Modal>
      )}
      {modal === 'rename' && currentTarget && (
        <Modal title={`แก้ไขชื่อ "${currentTarget.name}"`} onClose={closeModal} onConfirm={confirmRename}>
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} autoFocus className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600" />
        </Modal>
      )}
      {modal === 'delete' && currentTarget && (
        <Modal title={`ลบ "${currentTarget.name}"?`} onClose={closeModal} onConfirm={confirmDelete} confirmText="Delete" confirmColor="red">
          <p>คุณแน่ใจหรือไม่ว่าต้องการลบผู้เข้าร่วมคนนี้?</p>
        </Modal>
      )}
       {modal === 'action-items' && (
        <Modal title="สรุป Action Items" onClose={closeModal}>
          {actionItems.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 max-h-60 overflow-y-auto">
              {actionItems.map((item, index) => <li key={index} className="text-sm">{item.trim()}</li>)}
            </ul>
          ) : (
            <p>ไม่พบ Action Items</p>
          )}
        </Modal>
      )}

    </div>
  );
};

export default LeftPanel;
