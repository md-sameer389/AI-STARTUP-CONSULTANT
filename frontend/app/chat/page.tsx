'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../lib/api';
import { Send, Upload, FileText, Bot, User, Loader2, X, CheckCircle2 } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [userId, setUserId] = useState('demo-user');

  useEffect(() => {
    const stored = localStorage.getItem('user_id');
    if (stored) {
      setUserId(stored);
    }
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    try {
      const res = await api.chat(question, userId);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: res.answer, sources: res.sources }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.response?.data?.detail || 'Failed to get a response. Please try again.'}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext || '')) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Unsupported file type. Please upload a PDF or DOCX file.' }
      ]);
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadDocument(file, userId);
      setUploadedDocs(prev => [...prev, file.name]);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `✅ Document "${file.name}" has been indexed successfully. You can now ask questions about it.` }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Failed to upload document: ${err.response?.data?.detail || err.message}` }
      ]);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AuthGuard>
    <div className="flex-grow flex flex-col max-w-4xl mx-auto w-full px-4 md:px-6 py-8 gap-6">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Document <span className="gradient-text">Q&A</span>
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Upload your business documents and chat with them using AI-powered retrieval.
          </p>
        </div>

        {/* Upload Button */}
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-all disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 size={14} className="animate-spin" /> Indexing...</>
            ) : (
              <><Upload size={14} /> Upload Document</>
            )}
          </button>
        </div>
      </div>

      {/* Uploaded Documents Pills */}
      {uploadedDocs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {uploadedDocs.map((doc, idx) => (
            <span key={idx} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-successColor/10 border border-successColor/20 text-successColor text-[10px] font-semibold">
              <CheckCircle2 size={12} />
              {doc}
            </span>
          ))}
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-grow glass-card p-4 md:p-6 flex flex-col gap-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex-grow flex flex-col items-center justify-center text-center gap-4 py-12">
            <div className="p-4 rounded-2xl bg-primaryAccent/10 border border-primaryAccent/20 text-primaryAccent">
              <Bot size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Start a Conversation</h3>
              <p className="text-xs text-textSecondary max-w-sm">
                Upload a PDF or DOCX document, then ask questions about its contents.
                The AI will retrieve relevant passages and generate informed answers.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 mt-1">
                <div className="h-7 w-7 rounded-lg bg-primaryAccent/10 border border-primaryAccent/20 flex items-center justify-center text-primaryAccent">
                  <Bot size={14} />
                </div>
              </div>
            )}

            <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primaryAccent text-white rounded-br-md'
                : 'bg-white/5 border border-borderColor text-textPrimary rounded-bl-md'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] text-textSecondary uppercase tracking-wider font-semibold">Sources</span>
                  {msg.sources.map((src, sIdx) => (
                    <span key={sIdx} className="flex items-center gap-1 text-[10px] text-primaryAccent">
                      <FileText size={10} /> {src}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex-shrink-0 mt-1">
                <div className="h-7 w-7 rounded-lg bg-secondaryAccent/10 border border-secondaryAccent/20 flex items-center justify-center text-secondaryAccent">
                  <User size={14} />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-slide-up">
            <div className="flex-shrink-0 mt-1">
              <div className="h-7 w-7 rounded-lg bg-primaryAccent/10 border border-primaryAccent/20 flex items-center justify-center text-primaryAccent">
                <Bot size={14} />
              </div>
            </div>
            <div className="bg-white/5 border border-borderColor rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-primaryAccent" />
              <span className="text-xs text-textSecondary">Searching documents and generating answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="flex items-end gap-3">
        <div className="flex-grow glass-card p-1">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your documents..."
            rows={1}
            className="w-full rounded-xl bg-transparent px-4 py-3 text-sm text-white placeholder-textSecondary focus:outline-none resize-none"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="p-3.5 rounded-xl bg-indigo-violet text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-primaryAccent/20"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
    </AuthGuard>
  );
}
