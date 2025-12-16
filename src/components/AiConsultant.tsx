import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, ViewState } from '../types';
import { sendChatMessage } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { getApiKey } from "../utils/env";

interface AiConsultantProps {
    onNavigate?: (view: ViewState) => void;
}

const SUGGESTIONS = [
  "How can I save costs?",
  "Automate my workflow",
  "Book a demo"
];

const AiConsultant: React.FC<AiConsultantProps> = ({ onNavigate }) => {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  
  // Text Chat State
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm your Khanect AI Assistant. How can I help you optimize your business today?" }
  ]);
  const [isTextLoading, setIsTextLoading] = useState(false);
  
  // Use a ref for the scrollable container
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Voice Call State
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isVoiceConnecting, setIsVoiceConnecting] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(0); 
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
        scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, mode, isTextLoading]);

  useEffect(() => {
    return () => {
      stopVoiceCall();
    };
  }, []);

  const handleTextSend = useCallback(async (textOverride?: string) => {
    if (isTextLoading) return;

    const textToSend = typeof textOverride === 'string' ? textOverride : input;

    if (!textToSend.trim()) {
        setInputError("Please enter a valid message.");
        return;
    }
    
    setInputError(null);

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTextLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const { text, groundingMetadata } = await sendChatMessage(textToSend, history);
      setMessages((prev) => [...prev, { role: 'model', text: text, groundingMetadata }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please check your internet connection.", isError: true }]);
    } finally {
      setIsTextLoading(false);
    }
  }, [input, isTextLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (inputError && e.target.value.trim()) {
        setInputError(null);
    }
  };

  const toggleVoiceMode = () => {
      if (mode === 'text') {
          setMode('voice');
          startVoiceCall();
      } else {
          stopVoiceCall();
          setMode('text');
      }
  };

  // --- VOICE CALL LOGIC ---
  const startVoiceCall = async () => {
    setVoiceError(null);
    setIsVoiceConnecting(true);
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) throw new Error("AudioContext not supported");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
              echoCancellation: true, 
              noiseSuppression: true,
              autoGainControl: true
          } 
      });
      streamRef.current = stream;

      inputAudioContextRef.current = new AudioContextClass();
      audioContextRef.current = new AudioContextClass();
      nextStartTimeRef.current = 0;

      const outputAnalyser = audioContextRef.current.createAnalyser();
      outputAnalyser.fftSize = 256;
      outputAnalyser.connect(audioContextRef.current.destination);
      outputAnalyserRef.current = outputAnalyser;

      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `You are a helpful AI business assistant for Khanect Ai. Keep answers short, professional, and conversational.`,
        },
        callbacks: {
          onopen: () => {
            setIsVoiceConnecting(false);
            setIsVoiceConnected(true);
            
            if (!inputAudioContextRef.current || !streamRef.current) return;
            
            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            sourceRef.current = source;
            
            const inputAnalyser = inputAudioContextRef.current.createAnalyser();
            inputAnalyser.fftSize = 256; 
            inputAnalyserRef.current = inputAnalyser;
            source.connect(inputAnalyser);

            const updateVolume = () => {
                const isOutputting = audioQueueRef.current.length > 0;
                const activeAnalyser = isOutputting ? outputAnalyserRef.current : inputAnalyserRef.current;
                
                if (activeAnalyser) {
                    const dataArray = new Uint8Array(activeAnalyser.frequencyBinCount);
                    activeAnalyser.getByteFrequencyData(dataArray);
                    const sum = dataArray.reduce((a, b) => a + b, 0);
                    let average = sum / dataArray.length;
                    if (!isOutputting) average = Math.min(255, average * 2.5);
                    setVolumeLevel(average); 
                }
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();

            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const currentSampleRate = inputAudioContextRef.current?.sampleRate || 48000;
              const downsampledData = downsampleTo16000(inputData, currentSampleRate);
              const pcmData = float32ToInt16(downsampledData);
              const base64Data = arrayBufferToBase64(pcmData.buffer);

              sessionPromise.then((session) => {
                session.sendRealtimeInput({
                  media: { mimeType: 'audio/pcm;rate=16000', data: base64Data }
                });
              });
            };

            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             const interrupted = message.serverContent?.interrupted;
             if (interrupted) {
                audioQueueRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
                audioQueueRef.current = [];
                setIsVoiceSpeaking(false);
                if (audioContextRef.current) nextStartTimeRef.current = audioContextRef.current.currentTime;
                return;
             }

             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && audioContextRef.current) {
                setIsVoiceSpeaking(true);
                const audioData = base64ToArrayBuffer(base64Audio);
                const float32Data = int16ToFloat32(new Int16Array(audioData));
                const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
                audioBuffer.getChannelData(0).set(float32Data);

                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                
                if (outputAnalyserRef.current) source.connect(outputAnalyserRef.current);
                else source.connect(audioContextRef.current.destination);
                
                const currentTime = audioContextRef.current.currentTime;
                const startTime = Math.max(currentTime, nextStartTimeRef.current);
                source.start(startTime);
                nextStartTimeRef.current = startTime + audioBuffer.duration;
                
                audioQueueRef.current.push(source);
                source.onended = () => {
                    audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
                    if (audioQueueRef.current.length === 0) setIsVoiceSpeaking(false);
                };
             }
          },
          onclose: () => {
            setIsVoiceConnected(false);
            setIsVoiceConnecting(false);
            setIsVoiceSpeaking(false);
          },
          onerror: (err) => {
            console.error("Voice Error", err);
            setVoiceError("Connection disrupted.");
          }
        }
      });
      sessionRef.current = sessionPromise;

    } catch (err) {
      console.error("Failed to start voice call", err);
      setVoiceError("Connection failed.");
      setIsVoiceConnecting(false);
    }
  };

  const stopVoiceCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
    }
    setVolumeLevel(0);
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
    audioQueueRef.current.forEach(source => { try { source.stop(); } catch (e) {} });
    audioQueueRef.current = [];
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') inputAudioContextRef.current.close().catch(console.error);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close().catch(console.error);
    if (sessionRef.current) { sessionRef.current.then((session: any) => session.close()); sessionRef.current = null; }
    setIsVoiceConnected(false);
    setIsVoiceConnecting(false);
    setIsVoiceSpeaking(false);
    nextStartTimeRef.current = 0;
  };

  // ... (Helper functions)
  function downsampleTo16000(buffer: Float32Array, sampleRate: number): Float32Array {
    if (sampleRate === 16000) return buffer;
    const ratio = sampleRate / 16000;
    const newLength = Math.ceil(buffer.length / ratio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < newLength) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }
  function float32ToInt16(float32: Float32Array): Int16Array {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  }
  function int16ToFloat32(int16: Int16Array): Float32Array {
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / 32768.0;
      }
      return float32;
  }
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes.buffer;
  }

  return (
    <div className="w-full h-full bg-white/80 dark:bg-[#0F0F11]/90 backdrop-blur-xl rounded-2xl flex flex-col relative overflow-hidden font-sans border border-white/20 dark:border-white/5 transition-all duration-300">
        
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100/50 dark:border-white/5 z-10 transition-colors">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-lime/20 to-brand-lime/5 flex items-center justify-center border border-brand-lime/20">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" className="fill-brand-lime stroke-brand-lime" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                     </svg>
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Khanect AI</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-brand-lime rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Assistant</span>
                    </div>
                </div>
            </div>
            {onNavigate && (
                <button 
                    onClick={() => onNavigate(ViewState.LANDING)}
                    className="w-8 h-8 rounded-full text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-all duration-300 ease-fluid hover:rotate-90"
                    aria-label="Close Chat"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 relative custom-scrollbar transition-colors">
            
            {/* Voice Mode Overlay */}
            {mode === 'voice' && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-md animate-fade-in-up">
                    <div className="text-center p-6 w-full max-w-xs relative">
                         {/* Decorative Orb Background */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-lime/20 rounded-full blur-[80px] pointer-events-none"></div>

                         {voiceError ? (
                            <div className="flex flex-col items-center relative z-10">
                                <div className="text-red-500 mb-4 font-bold">Connection Failed</div>
                                <button onClick={() => { stopVoiceCall(); setMode('text'); }} className="px-6 py-2 bg-gray-100 dark:bg-white/10 rounded-full text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/20 text-black dark:text-white transition-colors">Close</button>
                            </div>
                         ) : (
                             <div className="flex flex-col items-center gap-6 relative z-10">
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-fluid ${isVoiceConnected ? 'bg-black dark:bg-white text-brand-lime dark:text-black shadow-2xl shadow-brand-lime/20 scale-110' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500'}`}>
                                    {isVoiceConnecting ? (
                                        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <div className="flex gap-1 h-10 items-center">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="w-1.5 bg-current rounded-full transition-all duration-75" style={{ height: `${16 + volumeLevel/8 * (Math.random() + 0.5)}px` }}></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">Listening...</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-medium">Voice Mode Active</p>
                                </div>
                                <button 
                                    onClick={toggleVoiceMode} 
                                    className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/20 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 ease-fluid hover:scale-110"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                             </div>
                         )}
                    </div>
                </div>
            )}

            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-up origin-bottom`}>
                    <div className={`max-w-[85%] px-5 py-3.5 text-[14px] leading-relaxed shadow-sm transition-all duration-300 ease-fluid hover:scale-[1.01] ${
                        msg.role === 'user' 
                        ? 'bg-brand-lime text-black rounded-[20px] rounded-tr-sm font-medium' 
                        : 'bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-[20px] rounded-tl-sm border border-gray-100 dark:border-white/5 backdrop-blur-sm'
                    } ${msg.isError ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/10 dark:text-red-300 dark:border-red-900/20' : ''}`}>
                        {msg.text}
                        {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
                                {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                                    chunk.web?.uri && <a key={i} href={chunk.web.uri} target="_blank" className="text-[10px] bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-black/10 dark:hover:bg-white/20 truncate max-w-[120px] text-current opacity-70 hover:opacity-100 transition-opacity">Source {i+1}</a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
            
            {isTextLoading && (
                <div className="flex justify-start animate-fade-in-up">
                    <div className="bg-white dark:bg-white/5 rounded-[20px] rounded-tl-sm px-5 py-4 shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
                        <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                </div>
            )}

            {messages.length === 1 && !isTextLoading && (
                <div className="flex flex-wrap gap-2 mt-2 px-1 animate-fade-in-up delay-200">
                    {SUGGESTIONS.map((suggestion, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleTextSend(suggestion)}
                            className="text-xs font-medium bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full hover:border-brand-lime dark:hover:border-brand-lime hover:text-black dark:hover:text-brand-lime hover:bg-brand-lime/10 transition-all duration-300 ease-fluid hover:scale-105"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
            <div ref={chatContainerRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 z-10 transition-colors">
            <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-full p-1.5 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-lime/50 transition-all duration-300 ease-fluid hover:shadow-md">
                 <button 
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-300 ease-fluid hover:scale-110"
                    title="Attach file"
                 >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                 </button>
                
                <input 
                    type="text" 
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={mode === 'voice' ? "Voice active..." : "Type your message..."}
                    className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none text-sm px-2"
                    disabled={mode === 'voice' || isTextLoading}
                />
                 
                 {input.trim() ? (
                    <button 
                        onClick={() => handleTextSend()}
                        className="w-9 h-9 rounded-full bg-brand-lime text-black flex items-center justify-center hover:scale-110 hover:bg-brand-limeHover transition-all duration-300 ease-fluid shadow-lg shadow-brand-lime/20"
                        title="Send"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                 ) : (
                    <button 
                        onClick={toggleVoiceMode}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ease-fluid hover:scale-110 ${mode === 'voice' ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-brand-lime hover:bg-gray-200 dark:hover:bg-white/10'}`}
                        title="Voice Mode"
                    >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                    </button>
                 )}
            </div>
            <div className="text-center mt-2">
                 <p className="text-[10px] text-gray-400 dark:text-gray-600">Powered by Gemini AI • Khanect Automation</p>
            </div>
        </div>
    </div>
  );
};

export default AiConsultant;