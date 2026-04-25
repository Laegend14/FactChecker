/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Search, 
  Send, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Loader2, 
  Database, 
  Globe, 
  Zap,
  Activity,
  ChevronRight,
  RefreshCw,
  Terminal,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGenLayerClient, DEFAULT_RPC } from './lib/genlayer';
import { TransactionStatus } from 'genlayer-js/types';

// Fetch contract address from environment variable
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

interface Claim {
  text: string;
  verdict: 'TRUE' | 'FALSE' | 'UNDETERMINED';
  reasoning: string;
}

export default function App() {
  const [claims, setClaims] = useState<Record<string, Claim>>({});
  const [inputText, setInputText] = useState('');
  const [rpcUrl, setRpcUrl] = useState(DEFAULT_RPC);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = getGenLayerClient(rpcUrl);

  const fetchClaims = useCallback(async () => {
    if (!CONTRACT_ADDRESS) return;
    setIsRefreshing(true);
    try {
      const result = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'get_claims',
        args: [],
      });
      setClaims(result as unknown as Record<string, Claim>);
    } catch (err: any) {
      console.error(err);
      setError('Connection dropped. Verify RPC and Contract Signature.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  }, [client, rpcUrl]);

  useEffect(() => {
    fetchClaims();
    const interval = setInterval(fetchClaims, 15000);
    return () => clearInterval(interval);
  }, [fetchClaims]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText || !CONTRACT_ADDRESS) return;

    setIsLoading(true);
    setError(null);

    try {
      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'check_claim',
        args: [inputText],
        value: 0n,
      });

      console.log('TX DISPATCHED:', txHash);
      
      await client.waitForTransactionReceipt({
        hash: txHash,
        status: TransactionStatus.ACCEPTED,
      });

      setInputText('');
      await fetchClaims();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Verification consensus failed. Check node logs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <header className="relative z-10 border-b border-white/5 bg-[#05060f]/80 backdrop-blur-xl sticky top-0 px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 border border-white/10"
          >
            <Shield className="text-white" size={26} />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tighter text-white flex items-center gap-2">
              GenLayer <span className="text-indigo-400 font-light italic">Core Proof</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">Consensus Bridge Active</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 w-full md:w-auto">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase font-bold text-slate-600 flex items-center gap-1.5 mb-1.5 mr-1 tracking-widest">
              <Globe size={11} className="text-indigo-500" /> Active RPC Node
            </span>
            <div className="relative group">
              <input 
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[11px] font-mono text-slate-400 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all w-full md:w-72 shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20">
                <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-cyan-400 opacity-100' : ''} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1500px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Verification Architecture Side */}
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
            >
              <Zap size={12} className="text-indigo-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">GenVM Execution Provider</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black tracking-tighter text-white leading-tight"
            >
              Qualitative Proof. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Validated On-Chain.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg max-w-md leading-relaxed font-medium"
            >
              Submit semantic data to the multi-validator AI consensus protocol. Truth is determined by network equilibrium.
            </motion.p>
          </div>

          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative group overflow-hidden"
          >
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] group-hover:bg-indigo-600/10 transition-colors" />
            
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <Activity size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-white">System Input Portal</h3>
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Semantic Payload V1.2</p>
                </div>
              </div>
              <Cpu size={20} className="text-white/5 group-hover:text-white/10 transition-colors" />
            </div>

            {!CONTRACT_ADDRESS ? (
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6">
                <div className="flex gap-4">
                  <Database size={20} className="text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-amber-500 text-xs font-black uppercase tracking-widest mb-1">Configuration Locked</h4>
                    <p className="text-[13px] text-amber-200/60 leading-relaxed">
                      Provider endpoint <code>VITE_CONTRACT_ADDRESS</code> is null. Link your IA contract via <code>.env</code> settings.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 relative">
                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.25em]">Claim Payload</label>
                    <span className="text-[9px] font-mono text-slate-700 uppercase">UTF-8 Encoded</span>
                  </div>
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter claim for semantic resolution..."
                    className="w-full h-44 bg-black/40 border border-white/5 rounded-3xl p-6 text-[15px] text-slate-100 placeholder:text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium leading-relaxed shadow-2xl"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || !CONTRACT_ADDRESS}
                  className="w-full bg-[#1e234a] hover:bg-indigo-600 text-white font-black uppercase tracking-[0.3em] text-[11px] py-6 rounded-[1.5rem] shadow-2xl active:scale-[0.98] disabled:opacity-20 disabled:scale-100 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4 group/btn overflow-hidden relative border border-indigo-400/20"
                >
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover/btn:opacity-40 translate-y-full group-hover/btn:translate-y-0 transition-all" />
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-cyan-400" /> 
                      <span className="animate-pulse">Mining Consensus...</span>
                    </>
                  ) : (
                    <>
                      Execute Verification <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 mt-8 flex gap-4 text-rose-400 text-[12px] items-center font-medium"
                >
                  <XCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          <section className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-2">
              <span className="text-[10px] uppercase font-black text-slate-600 tracking-[0.2em] block">Protocol Layer</span>
              <span className="text-xs font-mono text-indigo-400 font-bold block">Consensus V2.1.0</span>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-2 text-right">
              <span className="text-[10px] uppercase font-black text-slate-600 tracking-[0.2em] block">Data Authority</span>
              <span className="text-xs font-mono text-cyan-400 font-bold block">Nondet-Unsafe</span>
            </div>
          </section>
        </div>

        {/* Ledger Registry Side */}
        <div className="lg:col-span-7">
          <div className="flex justify-between items-center mb-10 bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md sticky top-24 z-20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Terminal size={14} className="text-indigo-500" />
              </div>
              <div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Truth Ledger Registry</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse mr-1" />
                  <span className="text-[10px] font-mono text-slate-500 font-black uppercase tracking-tighter">Syncing state from {Object.keys(claims).length} nodes</span>
                </div>
              </div>
            </div>
            <div className="bg-indigo-500/10 text-indigo-400 px-5 py-2 rounded-2xl font-mono text-[11px] font-black border border-indigo-500/20 shadow-inner">
               {Object.keys(claims).length} RECORDS_INSCRIBED
            </div>
          </div>

          <div className="space-y-8 pb-32">
            <AnimatePresence mode="popLayout" initial={false}>
              {Object.keys(claims).length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] py-40 text-center"
                >
                  <Search size={64} className="mx-auto mb-8 text-slate-800 opacity-50" />
                  <p className="text-[11px] uppercase tracking-[0.5em] text-slate-700 font-black">Zero Records Found in Ledger</p>
                </motion.div>
              ) : (
                (Object.entries(claims) as [string, Claim][]).reverse().map(([id, claim], index) => (
                  <motion.div 
                    key={id}
                    layout
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 120,
                      damping: 15,
                      delay: index * 0.05 
                    }}
                    className="bg-[#0c0d1b] border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="p-10 flex flex-col md:flex-row gap-10 relative z-10">
                      <div className="flex-shrink-0 flex items-start">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className={`p-6 rounded-[2rem] border-2 flex items-center justify-center shadow-2xl relative ${
                            claim.verdict === 'TRUE' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-emerald-500/5' : 
                            claim.verdict === 'FALSE' ? 'bg-rose-500/5 border-rose-500/20 text-rose-500 shadow-rose-500/5' : 
                            'bg-amber-500/5 border-amber-500/20 text-amber-500 shadow-amber-500/5'
                          }`}
                        >
                          {claim.verdict === 'TRUE' ? <CheckCircle2 size={36} strokeWidth={1.5} /> : 
                           claim.verdict === 'FALSE' ? <XCircle size={36} strokeWidth={1.5} /> : 
                           <HelpCircle size={36} strokeWidth={1.5} />}
                        </motion.div>
                      </div>
                      
                      <div className="flex-grow space-y-6">
                        <div className="flex justify-between items-center">
                          <div className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-[0.2em] shadow-inner ${
                            claim.verdict === 'TRUE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 
                            claim.verdict === 'FALSE' ? 'bg-rose-500/20 text-rose-400 border-rose-500/20' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {claim.verdict}
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-[11px] font-mono text-slate-500 font-black opacity-20">RECORD_0x{id.padStart(4, '0')}</span>
                             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
                          </div>
                        </div>
                        
                        <p className="text-2xl font-bold tracking-tight text-white leading-[1.3] pt-2">
                          "{claim.text}"
                        </p>
                        
                        <div className="bg-black/60 rounded-[1.5rem] p-7 border border-white/5 relative group/logic overflow-hidden shadow-inner">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/50 group-hover/logic:bg-indigo-500 transition-colors" />
                          <div className="flex items-center gap-3 mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            <Cpu size={14} className="text-indigo-400" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Consensus Engine Reasoning</span>
                          </div>
                          <p className="text-[15px] text-slate-400 leading-relaxed italic font-medium">
                            {claim.reasoning}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-8 z-30 pointer-events-none flex justify-center">
         <motion.div 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="bg-[#0c0d1b]/90 backdrop-blur-3xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-10 shadow-3xl pointer-events-auto"
         >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Protocol Integrated</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-5 h-5 rounded-full bg-indigo-900 border border-white/10 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
                 ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Multimodal consensus cluster active</span>
            </div>
         </motion.div>
      </footer>
    </div>
  );
}



