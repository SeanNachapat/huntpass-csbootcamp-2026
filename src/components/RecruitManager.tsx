'use client';

import { useState } from 'react';
import { Users, Upload, Plus, X, Info } from 'lucide-react';
import { addRecruit, bulkImportRecruits } from '@/app/actions';
import { houses } from '@/lib/houses';
import { read, utils } from 'xlsx';

export default function RecruitManager({ huntId }: { huntId: string }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const [fileError, setFileError] = useState<string>('');
  const [isValidFile, setIsValidFile] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const REQUIRED_HEADERS = ['name', 'surname', 'nickname', 'house', 'username', 'password'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    setIsValidFile(false);

    if (!file) return;

    try {
      let headers: string[] = [];
      let preview: any[] = [];

      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
          headers = Object.keys(data[0]).map(h => String(h).trim());
          preview = data.slice(0, 3);
        }
      } else {
        const buffer = await file.arrayBuffer();
        const workbook = read(buffer, { type: 'buffer', codepage: 65001 });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays to get headers easily
        const data: any[][] = utils.sheet_to_json(worksheet, { header: 1 });
        if (data.length > 0) {
          headers = data[0].map((h: any) => String(h).trim());
        }
        // Extract first 3 rows for preview
        preview = utils.sheet_to_json(worksheet).slice(0, 3);
      }

      if (headers.length === 0) {
        setFileError('File is empty or format is unrecognized.');
        return;
      }

      const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        setFileError(`Missing required columns: ${missingHeaders.join(', ')}`);
        return;
      }

      // All good!
      setIsValidFile(true);
      setPreviewData(preview);
    } catch (err: any) {
      setFileError('Failed to read file. Please ensure it is a valid CSV, JSON, or Excel file.');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Add Single Button */}
      <button 
        onClick={() => setIsAddOpen(true)}
        className="flex-1 bg-white/40 p-6 rounded-2xl border-2 border-dashed border-paper-border flex flex-col justify-center items-center text-center hover:bg-white hover:border-seal-gold hover:text-seal-gold transition group shadow-sm hover:-translate-y-1 cursor-pointer"
      >
        <div className="bg-passport-ivory paper-texture text-seal-gold p-3 rounded-full mb-3 shadow-sm border border-paper-border group-hover:scale-110 group-hover:bg-seal-gold group-hover:text-white transition-all">
          <Plus size={24} strokeWidth={3} />
        </div>
        <span className="font-playfair font-bold text-passport-navy group-hover:text-seal-gold">Add Recruit</span>
      </button>

      {/* Bulk Import Button */}
      <button 
        onClick={() => setIsImportOpen(true)}
        className="flex-1 bg-white/40 p-6 rounded-2xl border-2 border-dashed border-paper-border flex flex-col justify-center items-center text-center hover:bg-white hover:border-seal-gold hover:text-seal-gold transition group shadow-sm hover:-translate-y-1 cursor-pointer"
      >
        <div className="bg-passport-ivory paper-texture text-seal-gold p-3 rounded-full mb-3 shadow-sm border border-paper-border group-hover:scale-110 group-hover:bg-seal-gold group-hover:text-white transition-all">
          <Upload size={24} strokeWidth={3} />
        </div>
        <span className="font-playfair font-bold text-passport-navy group-hover:text-seal-gold">Bulk Import</span>
      </button>

      {/* Add Single Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 text-left border border-seal-gold/50">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
              <h3 className="font-playfair font-bold text-passport-navy flex items-center gap-2 text-xl">
                <Users size={20} className="text-seal-gold" /> Register Recruit
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm"><X size={16}/></button>
            </div>
            <form 
              action={async (fd) => { 
                try {
                  const res = await addRecruit(fd); 
                  if (res && 'error' in res && res.error) {
                    alert(res.error);
                  } else {
                    setIsAddOpen(false); 
                  }
                } catch (err) {
                  alert('เกิดข้อผิดพลาดในการลงทะเบียน: ' + String(err));
                }
              }} 
              className="p-6 flex flex-col gap-4"
            >
              <input type="hidden" name="huntId" value={huntId} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">Name (ชื่อ)</label>
                  <input type="text" name="name" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">Surname (นามสกุล)</label>
                  <input type="text" name="surname" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required />
                </div>
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">Nickname (ชื่อเล่น)</label>
                <input type="text" name="nickname" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required />
              </div>
              <div>
                <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">House (บ้าน)</label>
                <select name="house" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required>
                  {Object.keys(houses).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 mt-2 border-t border-paper-border space-y-4">
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">Username</label>
                  <input type="text" name="username" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest mb-1 block">Password</label>
                  <input type="password" name="password" className="w-full bg-white text-black border border-paper-border rounded-lg px-3 py-2.5 text-sm font-sarabun focus:ring-2 focus:ring-seal-gold outline-none" required />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-passport-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-passport-ivory paper-texture rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 text-left border border-seal-gold/50">
            <div className="flex justify-between items-center p-5 border-b border-paper-border bg-white/40">
              <h3 className="font-playfair font-bold text-passport-navy flex items-center gap-2 text-xl">
                <Upload size={20} className="text-seal-gold" /> Bulk Import Recruits
              </h3>
              <button onClick={() => setIsImportOpen(false)} className="text-muted-sepia hover:text-sepia-ink bg-white rounded-full p-1.5 border border-paper-border shadow-sm"><X size={16}/></button>
            </div>
            
            <form action={async (fd) => { 
                setIsImporting(true);
                try {
                  const res = await bulkImportRecruits(fd); 
                  if (res && 'error' in res && res.error) {
                    alert(res.error);
                  } else {
                    setIsImportOpen(false);
                  }
                } catch (err) {
                  alert('เกิดข้อผิดพลาดในการนำเข้าข้อมูล: ' + String(err));
                } finally {
                  setIsImporting(false);
                }
              }} 
              className="p-6 flex flex-col gap-6"
            >
              <input type="hidden" name="huntId" value={huntId} />
              
              <div className="bg-white/60 p-4 rounded-xl border border-paper-border relative group shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-sarabun font-bold text-sepia-ink text-sm">Upload File (.csv, .xlsx, .json)</div>
                  
                  {/* Tooltip Click Guide */}
                  <div className="relative">
                    <button type="button" onClick={(e) => { e.preventDefault(); setShowTooltip(!showTooltip); }}>
                      <Info size={16} className="text-seal-gold cursor-pointer hover:scale-110 transition-transform" />
                    </button>
                    <div className={`absolute right-0 bottom-full mb-2 w-64 bg-passport-navy text-passport-ivory text-xs p-3 rounded-xl shadow-xl transition-all z-10 border border-seal-gold/30 ${showTooltip ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                      <div className="font-sarabun font-bold mb-1 border-b border-seal-gold/30 pb-1 text-seal-gold">Required Column Headers:</div>
                      <ul className="list-disc pl-4 space-y-1 mt-2 font-sans text-xs mb-3">
                        <li>name</li>
                        <li>surname</li>
                        <li>nickname</li>
                        <li>house</li>
                        <li>username</li>
                        <li>password</li>
                      </ul>
                      <a href="/assets/example_recruits.csv" download className="block w-full text-center py-1.5 bg-seal-gold/20 hover:bg-seal-gold/40 text-seal-gold rounded-md text-[10px] font-mono font-bold uppercase tracking-wider transition">
                        Download Example
                      </a>
                      <div className="absolute -bottom-1 right-1 w-2 h-2 bg-passport-navy border-r border-b border-seal-gold/30 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
                <input 
                  type="file" 
                  name="file" 
                  onChange={handleFileChange}
                  accept=".csv, .json, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  className="w-full text-sm text-muted-sepia file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-mono file:font-bold file:bg-white file:text-passport-navy file:border file:border-paper-border hover:file:bg-slate-50 cursor-pointer shadow-sm transition"
                  required 
                />
              </div>

              {fileError && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-600 text-xs font-sarabun font-bold animate-in fade-in zoom-in-95">
                  ⚠️ {fileError}
                </div>
              )}

              {isValidFile && previewData.length > 0 && (
                <div className="bg-white rounded-xl border border-paper-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="bg-passport-navy text-white text-xs font-mono font-bold p-2 flex justify-between items-center px-4">
                    <span>DATA PREVIEW</span>
                    <span className="text-seal-gold/80 font-normal">First {previewData.length} rows</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead className="bg-slate-50 border-b border-paper-border text-muted-sepia uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-2 px-3 font-bold whitespace-nowrap">Recruit Name</th>
                          <th className="p-2 px-3 font-bold whitespace-nowrap">House</th>
                          <th className="p-2 px-3 font-bold whitespace-nowrap">Username</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-paper-border">
                        {previewData.map((row, idx) => {
                          const getValue = (keyToMatch: string) => {
                            const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === keyToMatch.toLowerCase());
                            return foundKey ? String(row[foundKey]).trim() : '-';
                          };
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition">
                              <td className="p-2 px-3 text-passport-navy font-bold whitespace-nowrap">{getValue('name')} {getValue('surname')}</td>
                              <td className="p-2 px-3 text-seal-gold whitespace-nowrap font-sarabun font-bold">{getValue('house')}</td>
                              <td className="p-2 px-3 text-sepia-ink whitespace-nowrap font-mono">{getValue('username')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-green-500/10 border-t border-green-500/20 p-2 text-green-700 text-xs font-sarabun font-bold text-center">
                    ✅ File looks perfect! Ready to import.
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => { setIsImportOpen(false); setFileError(''); setIsValidFile(false); setPreviewData([]); }} disabled={isImporting} className="flex-1 px-4 py-2.5 bg-white border border-paper-border text-sepia-ink rounded-lg text-sm font-sarabun font-bold hover:bg-slate-50 transition shadow-sm disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={isImporting || !isValidFile} className="flex-1 px-4 py-2.5 bg-passport-navy text-white rounded-lg text-sm font-sarabun font-bold hover:bg-passport-navy/90 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {isImporting ? <span className="animate-pulse">Importing...</span> : 'Upload & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
