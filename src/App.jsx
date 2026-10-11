import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ChevronDown, Send, Sparkles, BookOpen, Zap, List, RotateCcw, Check, Search, Menu, User, MessageSquare, StickyNote, Plus, Trash2, Save, X, Edit3, Bookmark, Download } from 'lucide-react';

export default function OfficeHours() {
  const [level, setLevel] = useState('Default');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "## Welcome to Office Hours\nI'm here to help you understand anything on this page.\n\n## How to use me\n• Highlight text in the article to ask about it\n• Save highlights as notes for later review\n• Switch reading levels using the toggle below\n• Try a quick action or just type a question",
      level: 'Default',
      illustration: 'learning'
    }
  ]);
  const [input, setInput] = useState('');
  const [highlighted, setHighlighted] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [levelMenuOpen, setLevelMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [savingMessageId, setSavingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const articleRef = useRef(null);
  const levelMenuRef = useRef(null);
  const noteRefs = useRef({});

  // === LEARNING LEVEL THEMES ===
  // Default + College specified in brief; Child and Teen derived from the same system
  const levelThemes = {
    Child: {
      bg: '#F5B5AC',       // soft pink (like illustration ref)
      fg: '#1E1E1E',
      emoji: '🧸',
      desc: 'Grades 1–5 · simple analogies'
    },
    Teen: {
      bg: '#F9D75B',       // sunny yellow
      fg: '#1E1E1E',
      emoji: '🎒',
      desc: 'Grades 9–12 · accessible vocab'
    },
    College: {
      bg: '#F29009',       // orange (per brief)
      fg: '#1E1E1E',
      emoji: '📚',
      desc: 'Undergrad · academic depth'
    },
    Default: {
      bg: '#1C2E22',       // dark green (per brief)
      fg: '#F7EEE5',
      emoji: '🎓',
      desc: 'Expert · full complexity'
    }
  };

  const levels = Object.keys(levelThemes).map(name => ({ name, ...levelThemes[name] }));
  const currentTheme = levelThemes[level];

  // === ARTICLE ===
  const article = {
    title: 'What is blockchain?',
    sections: [
      {
        heading: null,
        body: `Blockchain is a shared, immutable digital ledger, enabling the recording of transactions and the tracking of assets within a business network and providing a single source of truth.

Blockchain operates as a decentralized distributed database, with data stored across multiple computers, making it resistant to tampering. Transactions are validated through a consensus mechanism, ensuring agreement across the network.

In blockchain technology, each transaction is grouped into blocks, which are then linked together, forming a secure and transparent chain. This structure guarantees data integrity and provides a tamper-proof record, making blockchain ideal for applications like cryptocurrencies and supply chain management.

The key benefit of blockchain lies in its ability to provide security, transparency and trust without relying on traditional intermediaries, such as banks or other third parties. Its design reduces the risk of fraud and errors, making it especially valuable in industries where secure transactions are critical, including finance and healthcare.`
      },
      {
        heading: 'The evolution of blockchain',
        body: `Blockchain technology began with the introduction of Bitcoin in 2008, created by an anonymous figure or group known as Satoshi Nakamoto. Bitcoin's underlying technology was designed as a decentralized digital currency to enable peer-to-peer transactions without the need for a trusted intermediary like a bank.

With the development of platforms like Ethereum in 2015, blockchain began to support smart contracts—digital contracts stored on a blockchain that are automatically executed when predetermined terms and conditions are met.

Today, blockchain continues to evolve, with ongoing advancements aimed at improving scalability, privacy and its integration with emerging technologies like artificial intelligence (AI) and the Internet of Things (IoT).`
      },
      {
        heading: 'Key features of blockchain technology',
        body: `Blockchain technology contains several key features that enhance security, transparency and efficiency in transactions and data management:

Distributed ledger technology — All network participants have access to the distributed ledger and its immutable record of transactions. This shared ledger records transactions only once, eliminating the duplication of effort typical of traditional business networks.

Immutable records — No participant can change or tamper with a transaction after it's been recorded in the shared ledger. If a transaction record includes an error, a new transaction must be added to reverse the error, and both transactions are then visible.

Smart contracts — Smart contracts are self-executing agreements stored on the blockchain, where the terms are written in code and automatically executed when predefined conditions are met.

Public key cryptography — Public key cryptography is a method used to secure transactions and data on the blockchain by leveraging two cryptographic keys: a public key and a private key. The public key serves as an address for receiving cryptocurrency or data, while the private key is a confidential key that grants control over the associated digital assets.`
      },
      {
        heading: 'How blockchain works',
        body: `Each transaction is recorded as a "block" of data on the blockchain. These blocks capture key details about the movement of assets, whether tangible (such as a product) or intangible (such as intellectual property).

Each block is linked to the previous block and the one after it, creating a secure chain of data. This chain is done through cryptographic hashes, unique identifiers for each block. The hash of a block includes data from the previous block, ensuring the exact sequence and timing of each transaction.

Nodes in the blockchain network validate and maintain the blockchain by confirming each transaction's validity through consensus algorithms. Proof of work (PoW) and proof of stake (PoS) are some of the most commonly used consensus algorithms in blockchain networks.`
      }
    ]
  };

  const fullArticleText = article.sections.map(s =>
    (s.heading ? s.heading + '\n\n' : '') + s.body
  ).join('\n\n');

  useEffect(() => {
    if (activeTab === 'chat') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (levelMenuRef.current && !levelMenuRef.current.contains(e.target)) setLevelMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text && text.length > 1) setHighlighted(text);
  };

  // === ILLUSTRATION SYSTEM ===
  // Pick illustration based on keywords in response
  const pickIllustration = (text) => {
    const t = text.toLowerCase();
    if (/\b(block|chain|crypto|bitcoin|ethereum|hash|ledger|smart contract|node|consensus)\b/.test(t)) return 'chain';
    if (/\b(money|finance|bank|payment|currency|transaction|wallet|coin|cost|price)\b/.test(t)) return 'wallet';
    if (/\b(computer|tech|digital|software|code|algorithm|network|data)\b/.test(t)) return 'computer';
    if (/\b(history|past|invented|created|founded|origin|began|started|introduced)\b/.test(t)) return 'book';
    if (/\b(science|atom|molecule|experiment|research)\b/.test(t)) return 'beaker';
    if (/\b(house|home|rent|housing|building)\b/.test(t)) return 'house';
    if (/\b(security|lock|key|protect|safe|secure|cryptography)\b/.test(t)) return 'key';
    if (/\b(welcome|hello|hi|office hours|help|learn)\b/.test(t)) return 'learning';
    return 'learning';
  };

  // Illustrations removed per design update
  const Illustration_REMOVED = ({ type, bg, fg }) => {
    const stroke = fg;
    const sw = 2;
    const wrap = (children) => (
      <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" fill={bg} />
        {children}
      </svg>
    );
    switch (type) {
      case 'chain':
        return wrap(<g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="22" width="20" height="14" rx="2" />
          <rect x="30" y="38" width="20" height="14" rx="2" />
          <rect x="46" y="22" width="20" height="14" rx="2" />
          <line x1="34" y1="29" x2="46" y2="29" />
          <line x1="40" y1="36" x2="40" y2="38" />
          <line x1="40" y1="52" x2="40" y2="56" />
          <circle cx="40" cy="58" r="2" />
          <line x1="20" y1="56" x2="60" y2="56" />
        </g>);
      case 'wallet':
        return wrap(<g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="24" width="52" height="34" rx="3" />
          <path d="M14 32 Q14 24 22 24 L52 24" />
          <circle cx="54" cy="42" r="3" />
          <line x1="20" y1="40" x2="32" y2="40" />
          <line x1="20" y1="46" x2="28" y2="46" />
        </g>);
      case 'computer':
        return wrap(<g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="14" y="20" width="52" height="34" rx="2" />
          <line x1="10" y1="58" x2="70" y2="58" />
          <line x1="34" y1="62" x2="46" y2="62" />
          <circle cx="40" cy="28" r="2" />
          <line x1="22" y1="38" x2="34" y2="38" />
          <line x1="22" y1="44" x2="42" y2="44" />
          <path d="M48 36 L54 40 L48 44" />
        </g>);
      case 'book':
        return wrap(<g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 22 Q16 18 20 18 L40 22 L60 18 Q64 18 64 22 L64 58 Q64 62 60 62 L40 58 L20 62 Q16 62 16 58 Z" />
          <line x1="40" y1="22" x2="40" y2="58" />
          <line x1="22" y1="30" x2="36" y2="32" />
          <line x1="22" y1="38" x2="36" y2="40" />
          <line x1="44" y1="30" x2="58" y2="28" />
          <line x1="44" y1="38" x2="58" y2="36" />
        </g>);
      case 'beaker':
        return wrap(<g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M30 16 L30 36 L20 60 Q18 64 22 64 L58 64 Q62 64 60 60 L50 36 L50 16" />
          <line x1="26" y1="16" x2="54" y2="16" />
          <line x1="26" y1="46" x2="54" y2="46" />
          <circle cx="34" cy="54" r="2" />
          <circle cx="44" cy="56" r="1.5" />
          <circle cx="40" cy="50" r="1.5" />
        </g>);
      case 'house':
        return wrap(<g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 38 L40 16 L66 38" />
          <path d="M20 36 L20 62 L60 62 L60 36" />
          <rect x="34" y="46" width="12" height="16" />
          <rect x="26" y="42" width="6" height="6" />
          <rect x="48" y="42" width="6" height="6" />
        </g>);
      case 'key':
        return wrap(<g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="26" cy="40" r="10" />
          <circle cx="26" cy="40" r="3" />
          <line x1="36" y1="40" x2="64" y2="40" />
          <line x1="56" y1="40" x2="56" y2="48" />
          <line x1="62" y1="40" x2="62" y2="46" />
        </g>);
      case 'learning':
      default:
        return wrap(<g fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 30 L40 18 L64 30 L40 42 Z" />
          <path d="M22 33 L22 48 Q22 52 40 52 Q58 52 58 48 L58 33" />
          <line x1="64" y1="30" x2="64" y2="44" />
          <circle cx="64" cy="46" r="2" />
        </g>);
    }
  };

  const callClaude = async (userMessage) => {
    setLoading(true);
    const conversationHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    const levelInstructions = {
      Child: 'Explain at a 1st–5th grade level. Use very simple language, short sentences, and everyday analogies (school, toys, sports, food, family, games, animals). Avoid jargon.',
      Teen: 'Explain at a 9th–12th grade level. Use moderately simplified language. Introduce technical vocab but always explain it. Use examples relevant to high schoolers.',
      College: 'Explain at an undergraduate level. Preserve nuance and technical depth. Use academic but accessible language.',
      Default: 'Respond at an expert level. Preserve full complexity and domain terminology. Focus on accuracy and completeness.'
    };

    const systemPrompt = `You are "Office Hours" — a contextual learning assistant embedded as a browser sidebar plugin on the IBM Think article "What is blockchain?" The user is reading this article:

---
${fullArticleText}
---

${highlighted ? `The user has highlighted: "${highlighted}"` : ''}

CURRENT READING LEVEL: ${level}
${levelInstructions[level]}

RESPONSE STRUCTURE — IMPORTANT:
Always structure your response with short, descriptive headings followed by their explanations:

## [Short Heading Title]
[Brief explanation, 1-3 sentences or a short bulleted list]

## [Another Heading]
[Another short explanation]

Guidelines:
- 2-4 headings per response
- Headings 2-5 words, descriptive (e.g. "## What it does", "## Why it matters", "## A simple analogy")
- Brief, skimmable content under each — bullet points (•) where helpful, bold key terms with **double asterisks**
- Child mode: playful headings ("## The big idea", "## Picture this")
- College/Default: academic headings ("## Definition", "## Mechanism", "## Implications")
- Total under 200 words unless asked for more depth

TONE:
- Warm, encouraging, never condescending
- Preserve factual accuracy at every level
- Reference the article when relevant`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...conversationHistory, { role: 'user', content: userMessage }]
        })
      });

      const data = await response.json();
      const text = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      const illustration = pickIllustration(text + ' ' + userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: text, level, illustration }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '## Error\nSorry, I had trouble responding. Please try again.',
        level,
        illustration: 'learning'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    const displayMsg = highlighted ? `[About: "${highlighted.slice(0, 60)}${highlighted.length > 60 ? '…' : ''}"] ${userMsg}` : userMsg;
    setMessages(prev => [...prev, { role: 'user', content: displayMsg }]);
    setInput('');
    callClaude(userMsg);
  };

  const handleQuickAction = (action) => {
    if (loading) return;
    let prompt = '', display = '';
    if (highlighted) {
      const snippet = highlighted.length > 50 ? highlighted.slice(0, 50) + '…' : highlighted;
      switch (action) {
        case 'simplify': prompt = `Explain this in simpler terms: "${highlighted}"`; display = `[icon:auto_awesome] Simplify "${snippet}"`; break;
        case 'analogy': prompt = `Give me an analogy to understand: "${highlighted}"`; display = `[icon:bolt] Analogy for "${snippet}"`; break;
        case 'steps': prompt = `Break this down step-by-step: "${highlighted}"`; display = `[icon:format_list_numbered] Steps for "${snippet}"`; break;
        case 'define': prompt = `Define and explain: "${highlighted}"`; display = `[icon:menu_book] Define "${snippet}"`; break;
      }
    } else {
      switch (action) {
        case 'simplify': prompt = 'Summarize this article on blockchain in simpler terms.'; display = '[icon:auto_awesome] Simplify the article'; break;
        case 'analogy': prompt = 'Give me a good analogy for how blockchain works.'; display = '[icon:bolt] Analogy for blockchain'; break;
        case 'steps': prompt = 'Break down how blockchain works into clear steps.'; display = '[icon:format_list_numbered] Step-by-step breakdown'; break;
        case 'define': prompt = 'What are the key terms in this article and what do they mean?'; display = '[icon:menu_book] Define key terms'; break;
      }
    }
    setMessages(prev => [...prev, { role: 'user', content: display }]);
    callClaude(prompt);
  };

  const handleExplainDifferently = () => {
    if (loading) return;
    setMessages(prev => [...prev, { role: 'user', content: '[icon:autorenew] Explain differently' }]);
    callClaude('Can you explain that differently? Try a different approach or example.');
  };

  const handleLevelChange = (newLevel) => {
    setLevel(newLevel);
    setLevelMenuOpen(false);
    if (messages.length > 1 && !loading) {
      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistant && lastAssistant.level !== newLevel) {
        setMessages(prev => [...prev, { role: 'user', content: `[icon:tune] Switched to ${newLevel} mode` }]);
        setTimeout(() => callClaude(`Re-explain your last response at the ${newLevel} reading level.`), 100);
      }
    }
  };

  // === NOTES ===
  const createNote = (sourceText, body = '') => {
    const newNote = {
      id: Date.now(),
      number: notes.length + 1,
      sourceText: sourceText || '(general note)',
      body,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotes(prev => [...prev, newNote]);
    setActiveTab('notes');
    setEditingNoteId(newNote.id);
    setEditingText(body);
    setHighlighted('');
    return newNote;
  };

  const saveNoteFromHighlight = () => { if (highlighted) createNote(highlighted, ''); };

  const saveResponseToNote = (messageContent, noteId = null) => {
    const plainText = messageContent.replace(/## (.+)/g, '$1:').replace(/\*\*(.+?)\*\*/g, '$1');
    if (noteId) {
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, body: n.body ? n.body + '\n\n' + plainText : plainText } : n));
    } else {
      createNote(highlighted || '(saved from chat)', plainText);
    }
    setSavingMessageId(null);
  };

  const updateNoteBody = (id, body) => setNotes(prev => prev.map(n => n.id === id ? { ...n, body } : n));
  const deleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id).map((n, i) => ({ ...n, number: i + 1 })));
    if (editingNoteId === id) setEditingNoteId(null);
  };
  const scrollToNote = (id) => {
    const el = noteRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Download notes as PDF — opens a print-ready window the user can save as PDF
  const downloadNotesPDF = () => {
    if (notes.length === 0) return;
    const w = window.open('', '_blank');
    if (!w) {
      alert('Please allow pop-ups to download notes.');
      return;
    }
    const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const noteHTML = notes.map(n => `
      <div class="note">
        <div class="note-head">
          <span class="num">${n.number}</span>
          <span class="time">${escape(n.timestamp)}</span>
        </div>
        <div class="source-label">From article</div>
        <div class="source"><span class="hl">"${escape(n.sourceText)}"</span></div>
        <div class="body-label">My note</div>
        <div class="body">${escape(n.body || '(empty)')}</div>
      </div>
    `).join('');

    w.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Office Hours — Notes</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&family=PT+Mono&family=PT+Sans+Caption:wght@400;700&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'PT Mono', monospace;
    background: #F7EEE5;
    color: #1E1E1E;
    margin: 0;
    padding: 40px;
    font-size: 12px;
    line-height: 1.6;
  }
  .header {
    border-bottom: 1px dashed #C9BFB1;
    padding-bottom: 20px;
    margin-bottom: 30px;
  }
  .caption {
    font-family: 'PT Sans Caption', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 11px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  h1 {
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 32px;
    letter-spacing: -0.5px;
    margin: 0 0 8px;
  }
  .meta {
    font-family: 'PT Mono', monospace;
    font-size: 11px;
    opacity: 0.7;
  }
  .note {
    background: #fff;
    border: 1px solid #E8DFD3;
    border-radius: 0 0 4px 4px;
    padding: 24px;
    margin-bottom: 16px;
    page-break-inside: avoid;
  }
  .note-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #C9BFB1;
  }
  .num {
    background: #1E1E1E;
    color: #fff;
    padding: 3px 10px;
    border-radius: 12px;
    font-family: 'PT Sans Caption', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.08em;
  }
  .time {
    font-family: 'PT Sans Caption', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 10px;
  }
  .source-label, .body-label {
    font-family: 'PT Sans Caption', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 9px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .source { margin-bottom: 14px; font-style: italic; }
  .hl { background: #A1D8FF; padding: 2px 4px; }
  .body { white-space: pre-wrap; }
  .footer {
    margin-top: 30px;
    padding-top: 16px;
    border-top: 1px dashed #C9BFB1;
    font-family: 'PT Sans Caption', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 10px;
    opacity: 0.6;
    text-align: center;
  }
  @media print {
    body { background: #fff; padding: 24px; }
    .note { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="caption">Office Hours · My Notes</div>
    <h1>${escape(article.title)}</h1>
    <div class="meta">${notes.length} note${notes.length === 1 ? '' : 's'} · Saved ${escape(dateStr)}</div>
  </div>
  ${noteHTML}
  <div class="footer">End of notes · Use your browser's Save as PDF option</div>
  <script>
    window.addEventListener('load', () => setTimeout(() => window.print(), 400));
  </script>
</body>
</html>`);
    w.document.close();
  };

  // === MESSAGE FORMATTING ===
  const formatMessage = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let listBuffer = [];

    const flushList = () => {
      if (listBuffer.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} style={{
            margin: '4px 0 10px 0',
            padding: '0 0 0 16px',
            listStyle: 'none',
            fontFamily: "'PT Mono', monospace"
          }}>
            {listBuffer.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '4px', position: 'relative', paddingLeft: '12px', fontSize: '12px', lineHeight: 1.6 }}>
                <span style={{ position: 'absolute', left: 0 }}>•</span>
                {renderInline(item)}
              </li>
            ))}
          </ul>
        );
        listBuffer = [];
      }
    };

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <div key={`h-${i}`} style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: '20px',
            marginTop: elements.length > 0 ? '24px' : '4px',
            marginBottom: '8px',
            color: '#1E1E1E',
            letterSpacing: '-0.3px',
            lineHeight: 1.15
          }}>
            {trimmed.slice(3)}
          </div>
        );
      } else if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
        listBuffer.push(trimmed.slice(2));
      } else if (trimmed === '') {
        flushList();
      } else {
        flushList();
        elements.push(
          <div key={`p-${i}`} style={{
            marginBottom: '6px',
            lineHeight: 1.6,
            fontFamily: "'PT Mono', monospace",
            fontSize: '12px',
            color: '#1E1E1E'
          }}>
            {renderInline(trimmed)}
          </div>
        );
      }
    });
    flushList();
    return elements;
  };

  const renderInline = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      return <React.Fragment key={j}>{part}</React.Fragment>;
    });
  };

  // Render a user message: parse [icon:name] tokens into Material Symbols
  const renderUserMessage = (text) => {
    const parts = text.split(/(\[icon:[a-z_]+\])/g);
    return parts.map((part, idx) => {
      const m = part.match(/^\[icon:([a-z_]+)\]$/);
      if (m) {
        return (
          <span
            key={idx}
            className="material-symbols-outlined"
            style={{
              fontSize: '14px',
              verticalAlign: '-3px',
              marginRight: '4px',
              fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20"
            }}
          >
            {m[1]}
          </span>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const renderWithHighlight = (text) => {
    const noteTexts = notes.map(n => ({ text: n.sourceText, id: n.id, number: n.number, type: 'note' }));
    const activeHighlight = highlighted ? [{ text: highlighted, type: 'active' }] : [];
    const allRegions = [...noteTexts, ...activeHighlight];

    return text.split('\n\n').map((para, i) => {
      let segments = [{ text: para, highlight: null }];
      allRegions.forEach(region => {
        const newSegments = [];
        segments.forEach(seg => {
          if (seg.highlight) { newSegments.push(seg); return; }
          const parts = seg.text.split(region.text);
          parts.forEach((part, idx) => {
            if (part) newSegments.push({ text: part, highlight: null });
            if (idx < parts.length - 1) newSegments.push({ text: region.text, highlight: region });
          });
        });
        segments = newSegments;
      });

      return (
        <p key={i} style={{ marginBottom: '14px', lineHeight: 1.65 }}>
          {segments.map((seg, idx) => {
            if (!seg.highlight) return <React.Fragment key={idx}>{seg.text}</React.Fragment>;
            if (seg.highlight.type === 'active') {
              return <span key={idx} style={{ backgroundColor: '#FFEE00', padding: '0 2px' }}>{seg.text}</span>;
            }
            return (
              <span
                key={idx}
                ref={el => { if (el) noteRefs.current[seg.highlight.id] = el; }}
                onClick={() => { setActiveTab('notes'); setEditingNoteId(seg.highlight.id); }}
                style={{ backgroundColor: '#A1D8FF', padding: '0 4px 0 2px', cursor: 'pointer', borderRadius: '2px' }}
                title={`Note ${seg.highlight.number}`}
              >
                {seg.text}
                <sup style={{
                  fontSize: '9px', fontWeight: 700, marginLeft: '3px',
                  background: '#000', color: '#fff', padding: '1px 4px',
                  borderRadius: '8px', fontFamily: "'Inter', sans-serif"
                }}>{seg.highlight.number}</sup>
              </span>
            );
          })}
        </p>
      );
    });
  };

  const quickActions = [
    { id: 'simplify', label: 'Simplify', icon: Sparkles },
    { id: 'analogy', label: 'Analogy', icon: Zap },
    { id: 'steps', label: 'Step-by-step', icon: List },
    { id: 'define', label: 'Define', icon: BookOpen }
  ];

  // === COMMON STYLES ===
  const captionStyle = {
    fontFamily: "'PT Sans Caption', sans-serif",
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  };
  const bodyStyle = { fontFamily: "'PT Mono', monospace" };
  const headingFont = { fontFamily: "'Inter', sans-serif" };

  // SVG grid background data URI
  const gridSize = 32;
  const gridSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='${gridSize}' height='${gridSize}'><rect width='${gridSize}' height='${gridSize}' fill='%23F7EEE5'/><path d='M ${gridSize} 0 L 0 0 0 ${gridSize}' fill='none' stroke='%23D9CFC2' stroke-width='1'/></svg>`;
  const gridBg = `url("data:image/svg+xml;utf8,${gridSvg}")`;

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      background: '#fff',
      color: '#1E1E1E',
      fontSize: '14px'
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=PT+Mono&family=PT+Sans+Caption:wght@400;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet" />

      {/* Browser chrome */}
      <div style={{
        borderBottom: '1px solid #393939',
        background: '#f4f4f4',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
        fontFamily: "'IBM Plex Sans', sans-serif"
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '11px', height: '11px', background: '#ff5f57', borderRadius: '50%' }} />
          <div style={{ width: '11px', height: '11px', background: '#febc2e', borderRadius: '50%' }} />
          <div style={{ width: '11px', height: '11px', background: '#28c840', borderRadius: '50%' }} />
        </div>
        <div style={{ flex: 1, background: '#fff', border: '1px solid #e0e0e0', padding: '5px 12px', fontSize: '12px', borderRadius: '4px', color: '#525252' }}>
          🔒 ibm.com/think/topics/blockchain
        </div>
        <div style={{ ...captionStyle, fontSize: '10px', padding: '4px 10px', background: currentTheme.bg, color: currentTheme.fg, borderRadius: '4px' }}>
          Office Hours
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* === IBM WEBPAGE === */}
        <div style={{
          flex: 1, overflowY: 'auto', background: '#fff',
          fontFamily: "'IBM Plex Sans', sans-serif", color: '#161616'
        }}>
          <div style={{ background: '#161616', color: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <div style={{ padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center' }}><Menu size={20} /></div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginRight: '32px' }}>IBM</div>
              <div style={{ display: 'flex', height: '100%', fontSize: '14px' }}>
                {['Products', 'Solutions', 'Consulting'].map(item => (
                  <span key={item} style={{ padding: '0 16px', display: 'flex', alignItems: 'center', color: '#f4f4f4' }}>{item}</span>
                ))}
                <span style={{ padding: '0 16px', display: 'flex', alignItems: 'center', borderBottom: '3px solid #0f62fe', fontWeight: 500 }}>Think</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}><Search size={18} /></div>
              <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}><User size={18} /></div>
              <div style={{ background: '#0f62fe', color: '#fff', padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '14px' }}>Contact</div>
            </div>
          </div>

          <div ref={articleRef} onMouseUp={handleTextSelection} style={{ padding: '40px 56px', maxWidth: '820px', userSelect: 'text' }}>
            <div style={{ fontSize: '14px', marginBottom: '24px', color: '#525252' }}>
              <span style={{ color: '#0f62fe' }}>Think</span> <span style={{ margin: '0 8px' }}>›</span>
              <span style={{ color: '#0f62fe' }}>Topics</span> <span style={{ margin: '0 8px' }}>›</span>
              <span>Blockchain</span>
            </div>
            <div style={{ fontSize: '12px', padding: '4px 12px', border: '1px solid #0f62fe', color: '#0f62fe', display: 'inline-block', marginBottom: '24px' }}>Banking</div>
            <h1 style={{ fontSize: '54px', fontWeight: 300, lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.5px' }}>{article.title}</h1>
            <div style={{ fontSize: '14px', color: '#525252', marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid #e0e0e0' }}>
              <span style={{ color: '#0f62fe' }}>Stephanie Susnjara</span>, Staff Writer · <span style={{ color: '#0f62fe' }}>Ian Smalley</span>, Staff Editor
            </div>
            <div style={{ width: '100%', height: '320px', background: 'linear-gradient(135deg, #0f62fe 0%, #001d6c 50%, #161616 100%)', marginBottom: '40px', display: 'flex', alignItems: 'flex-end', padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: '60%', height: '100%', background: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
              <div style={{ color: '#fff', fontSize: '13px', opacity: 0.85, position: 'relative', zIndex: 1 }}>Featured · IBM Think</div>
            </div>
            {article.sections.map((section, i) => (
              <div key={i} style={{ marginBottom: '40px' }}>
                {section.heading && <h2 style={{ fontSize: '32px', fontWeight: 400, marginBottom: '20px', letterSpacing: '-0.25px' }}>{section.heading}</h2>}
                <div style={{ fontSize: '16px', color: '#393939', lineHeight: 1.6 }}>{renderWithHighlight(section.body)}</div>
              </div>
            ))}
          </div>
        </div>

        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            background: currentTheme.bg, color: currentTheme.fg, border: 'none',
            padding: '20px 10px', cursor: 'pointer', writingMode: 'vertical-rl',
            ...captionStyle, fontSize: '11px', fontWeight: 700
          }}>
            <ChevronLeft size={14} style={{ marginBottom: '6px' }} /> Office hours
          </button>
        )}

        {/* === OFFICE HOURS SIDEBAR === */}
        {sidebarOpen && (
          <div style={{
            width: '440px',
            display: 'flex',
            flexDirection: 'column',
            background: '#F7EEE5',
            flexShrink: 0,
            borderLeft: `1px solid ${currentTheme.bg}`
          }}>
            {/* Header — F7EEE5 background with 4px top accent in level color */}
            <div style={{
              borderTop: `4px solid ${currentTheme.bg}`,
              padding: '14px 18px',
              background: '#F7EEE5',
              color: '#1E1E1E',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ ...captionStyle, fontSize: '10px', marginBottom: '4px', opacity: 0.7 }}>
                  Plugin · Adaptive learning
                </div>
                <div style={{ ...headingFont, fontSize: '22px', fontWeight: 500, letterSpacing: '-0.4px' }}>
                  Office hours
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{
                background: 'transparent', border: `1px solid #1E1E1E`,
                padding: '6px', cursor: 'pointer', color: '#1E1E1E', display: 'flex'
              }}>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', background: '#F7EEE5', borderBottom: `1px solid ${currentTheme.bg}` }}>
              <button onClick={() => setActiveTab('chat')} style={{
                flex: 1, padding: '12px',
                background: activeTab === 'chat' ? currentTheme.bg : 'transparent',
                color: activeTab === 'chat' ? currentTheme.fg : '#1E1E1E',
                border: 'none', cursor: 'pointer',
                ...captionStyle, fontSize: '11px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <MessageSquare size={12} /> Chat
              </button>
              <button onClick={() => setActiveTab('notes')} style={{
                flex: 1, padding: '12px',
                background: activeTab === 'notes' ? currentTheme.bg : 'transparent',
                color: activeTab === 'notes' ? currentTheme.fg : '#1E1E1E',
                border: 'none', cursor: 'pointer',
                ...captionStyle, fontSize: '11px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <StickyNote size={12} /> Notes {notes.length > 0 && (
                  <span style={{
                    background: activeTab === 'notes' ? currentTheme.fg : currentTheme.bg,
                    color: activeTab === 'notes' ? currentTheme.bg : currentTheme.fg,
                    padding: '1px 6px', borderRadius: '8px', fontSize: '9px', letterSpacing: 0
                  }}>{notes.length}</span>
                )}
              </button>
            </div>

            {/* === CHAT TAB === */}
            {activeTab === 'chat' && (
              <>
                {highlighted && (
                  <div style={{ padding: '10px 18px', background: '#F7EEE5', borderBottom: `1px solid ${currentTheme.bg}30`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ ...captionStyle, fontSize: '9px', flexShrink: 0 }}>From page</span>
                      <span style={{ background: '#FFEE00', padding: '3px 6px', flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', ...bodyStyle, fontSize: '11px' }}>
                        {highlighted.length > 50 ? highlighted.slice(0, 50) + '…' : highlighted}
                      </span>
                      <button onClick={() => setHighlighted('')} style={{ background: 'transparent', border: '1px solid #1E1E1E', padding: '3px 7px', cursor: 'pointer', fontSize: '10px', ...captionStyle, fontWeight: 700 }}>Clear</button>
                    </div>
                    <button onClick={saveNoteFromHighlight} style={{
                      padding: '7px', border: '1px solid #1E1E1E', background: '#A1D8FF',
                      cursor: 'pointer', fontSize: '11px', ...captionStyle, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}>
                      <Bookmark size={11} /> Save as note
                    </button>
                  </div>
                )}

                {/* Messages — GRID BACKGROUND */}
                <div style={{
                  flex: 1, overflowY: 'auto', padding: '18px',
                  background: gridBg,
                  backgroundColor: '#F7EEE5',
                  display: 'flex', flexDirection: 'column', gap: '14px'
                }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{
                      alignSelf: m.role === 'user' ? 'flex-end' : 'stretch',
                      maxWidth: m.role === 'user' ? '85%' : '100%'
                    }}>
                      {m.role === 'assistant' ? (
                        <div style={{
                          background: '#FFFFFF',
                          border: '1px solid #E8DFD3',
                          borderRadius: '0 0 4px 4px',
                          padding: '72px 24px 20px 24px',
                          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
                          position: 'relative'
                        }}>
                          {/* Three punch holes */}
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: 0,
                            right: 0,
                            display: 'flex',
                            justifyContent: 'space-around',
                            paddingLeft: '20%',
                            paddingRight: '20%',
                            pointerEvents: 'none'
                          }}>
                            {[0, 1, 2].map(idx => (
                              <div key={idx} style={{
                                width: '11px',
                                height: '11px',
                                borderRadius: '50%',
                                background: '#F7EEE5',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.18)'
                              }} />
                            ))}
                          </div>

                          {/* Dotted ruler line — 20px below the punch holes */}
                          <div style={{
                            position: 'absolute',
                            top: '32px',
                            left: '20px',
                            right: '20px',
                            borderTop: '1px dashed #C9BFB1',
                            pointerEvents: 'none'
                          }} />

                          {/* Caption header — typewriter card style with colored mode chip */}
                          {m.level && (
                            <div style={{
                              ...captionStyle,
                              fontSize: '11px',
                              fontWeight: 700,
                              marginBottom: '14px',
                              color: '#1E1E1E',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              flexWrap: 'wrap'
                            }}>
                              <span>Office hours on…</span>
                              <span style={{
                                background: levelThemes[m.level].bg,
                                color: levelThemes[m.level].fg,
                                padding: '3px 8px',
                                ...captionStyle,
                                fontSize: '11px',
                                fontWeight: 700
                              }}>
                                {m.level.toUpperCase()} MODE
                              </span>
                            </div>
                          )}

                          {formatMessage(m.content)}

                          {i > 0 && !loading && (
                            <div style={{
                              marginTop: '14px',
                              paddingTop: '14px',
                              borderTop: '1px dashed #C9BFB1',
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap'
                            }}>
                              {i === messages.length - 1 && (
                                <button onClick={handleExplainDifferently} style={{
                                  padding: '5px 10px', border: '1px solid #1E1E1E',
                                  background: '#fff', cursor: 'pointer',
                                  ...captionStyle, fontSize: '9px', fontWeight: 700,
                                  display: 'flex', alignItems: 'center', gap: '4px'
                                }}>
                                  <RotateCcw size={9} /> Explain differently
                                </button>
                              )}
                              <button onClick={() => setSavingMessageId(savingMessageId === i ? null : i)} style={{
                                padding: '5px 10px', border: '1px solid #1E1E1E',
                                background: savingMessageId === i ? '#A1D8FF' : '#fff', cursor: 'pointer',
                                ...captionStyle, fontSize: '9px', fontWeight: 700,
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}>
                                <Bookmark size={9} /> Save to note
                              </button>
                            </div>
                          )}

                          {savingMessageId === i && (
                            <div style={{ marginTop: '10px', padding: '10px', background: '#A1D8FF', fontSize: '11px' }}>
                              <div style={{ ...captionStyle, fontSize: '9px', fontWeight: 700, marginBottom: '8px' }}>Save to:</div>
                              <button onClick={() => saveResponseToNote(m.content)} style={{
                                width: '100%', padding: '6px', border: '1px solid #1E1E1E',
                                background: '#fff', cursor: 'pointer', fontSize: '11px', ...bodyStyle,
                                marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                              }}>
                                <Plus size={10} /> New note
                              </button>
                              {notes.map(n => (
                                <button key={n.id} onClick={() => saveResponseToNote(m.content, n.id)} style={{
                                  width: '100%', padding: '6px', border: '1px solid #1E1E1E',
                                  background: '#fff', cursor: 'pointer', fontSize: '11px', ...bodyStyle,
                                  marginBottom: '4px', textAlign: 'left',
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                  Note {n.number}: {n.sourceText.slice(0, 30)}…
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{
                          background: currentTheme.bg,
                          color: currentTheme.fg,
                          padding: '12px 16px',
                          ...bodyStyle,
                          fontSize: '12px',
                          lineHeight: 1.55
                        }}>
                          {renderUserMessage(m.content)}
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div style={{
                      background: '#FFFFFF',
                      border: '1px solid #E8DFD3',
                      borderRadius: '0 0 4px 4px',
                      padding: '72px 24px 20px 24px',
                      ...captionStyle,
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#1E1E1E',
                      opacity: 0.7,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'space-around',
                        paddingLeft: '20%',
                        paddingRight: '20%',
                        pointerEvents: 'none'
                      }}>
                        {[0, 1, 2].map(idx => (
                          <div key={idx} style={{
                            width: '11px',
                            height: '11px',
                            borderRadius: '50%',
                            background: '#F7EEE5',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.18)'
                          }} />
                        ))}
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '32px',
                        left: '20px',
                        right: '20px',
                        borderTop: '1px dashed #C9BFB1',
                        pointerEvents: 'none'
                      }} />
                      <div style={{ width: '8px', height: '8px', background: currentTheme.bg, borderRadius: '50%' }} />
                      Thinking…
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Composer — F7EEE5 with 4px top accent */}
                <div style={{
                  background: '#F7EEE5',
                  borderTop: `4px solid ${currentTheme.bg}`,
                  padding: '14px 18px 16px'
                }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    {quickActions.map(action => {
                      const Icon = action.icon;
                      return (
                        <button key={action.id} onClick={() => handleQuickAction(action.id)} disabled={loading} style={{
                          padding: '6px 11px', border: '1px solid #1E1E1E',
                          background: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                          ...captionStyle, fontSize: '9px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '5px',
                          borderRadius: '999px', opacity: loading ? 0.5 : 1
                        }}>
                          <Icon size={10} /> {action.label}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ border: '1px solid #1E1E1E', background: '#fff', display: 'flex', flexDirection: 'column' }}>
                    <input
                      type="text" value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder={highlighted ? 'Ask about the highlighted text…' : 'Ask anything about this article…'}
                      style={{ padding: '11px 12px', border: 'none', background: '#fff', ...bodyStyle, fontSize: '12px', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', borderTop: '1px solid #1E1E1E' }}>
                      <div ref={levelMenuRef} style={{ position: 'relative' }}>
                        <button onClick={() => setLevelMenuOpen(!levelMenuOpen)} style={{
                          padding: '5px 12px',
                          border: 'none',
                          background: currentTheme.bg, color: currentTheme.fg,
                          cursor: 'pointer',
                          ...captionStyle, fontSize: '10px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                          <span>{level}</span>
                          <ChevronDown size={11} style={{ transform: levelMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }} />
                        </button>
                        {levelMenuOpen && (
                          <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, width: '280px', background: '#fff', border: '1px solid #1E1E1E', zIndex: 10 }}>
                            <div style={{ padding: '10px 12px', borderBottom: '1px solid #1E1E1E', ...captionStyle, fontSize: '9px', fontWeight: 700 }}>
                              Reading level
                            </div>
                            {levels.map(l => (
                              <button key={l.name} onClick={() => handleLevelChange(l.name)} style={{
                                width: '100%', padding: '10px 12px',
                                background: level === l.name ? l.bg : '#fff',
                                color: level === l.name ? l.fg : '#1E1E1E',
                                border: 'none', borderBottom: '1px solid #1E1E1E',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ ...headingFont, fontWeight: 500, fontSize: '14px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{l.name}</span>
                                    {level === l.name && <Check size={12} />}
                                  </div>
                                  <div style={{ ...captionStyle, fontSize: '9px', fontWeight: 400, opacity: 0.75 }}>{l.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={handleSend} disabled={loading || !input.trim()} style={{
                        padding: '7px 12px', border: 'none',
                        background: '#1E1E1E', color: '#F7EEE5',
                        cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center',
                        opacity: loading || !input.trim() ? 0.4 : 1
                      }}>
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* === NOTES TAB === */}
            {activeTab === 'notes' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F7EEE5' }}>
                <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${currentTheme.bg}30`, gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ ...captionStyle, fontSize: '10px', fontWeight: 700 }}>My notes ({notes.length})</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={downloadNotesPDF}
                      disabled={notes.length === 0}
                      title="Download all notes as PDF"
                      style={{
                        padding: '5px 10px',
                        border: '1px solid #1E1E1E',
                        background: notes.length === 0 ? '#F0E7DC' : '#1E1E1E',
                        color: notes.length === 0 ? '#999' : '#F7EEE5',
                        cursor: notes.length === 0 ? 'not-allowed' : 'pointer',
                        ...captionStyle, fontSize: '9px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <Download size={10} /> PDF
                    </button>
                    <button onClick={() => createNote(highlighted || '(general note)', '')} style={{
                      padding: '5px 10px', border: '1px solid #1E1E1E', background: '#A1D8FF',
                      cursor: 'pointer', ...captionStyle, fontSize: '9px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '5px'
                    }}>
                      <Plus size={10} /> New
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
                  {notes.length === 0 && (
                    <div style={{ padding: '24px', border: '1px dashed #1E1E1E', textAlign: 'center', background: '#fff' }}>
                      <div style={{ ...headingFont, fontWeight: 500, fontSize: '16px', marginBottom: '8px' }}>📝 No notes yet</div>
                      <div style={{ ...bodyStyle, fontSize: '11px', lineHeight: 1.6, opacity: 0.7 }}>
                        Highlight text in the article and click Save as note, or save a chatbot response.
                      </div>
                    </div>
                  )}

                  {notes.map(note => (
                    <div key={note.id} style={{ border: '1px solid #1E1E1E', marginBottom: '12px', background: '#fff' }}>
                      <div style={{ padding: '8px 12px', background: '#A1D8FF', borderBottom: '1px solid #1E1E1E', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#1E1E1E', color: '#fff', padding: '2px 8px', ...captionStyle, fontSize: '10px', fontWeight: 700, borderRadius: '10px' }}>{note.number}</span>
                          <span style={{ ...captionStyle, fontSize: '9px', fontWeight: 400 }}>{note.timestamp}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => scrollToNote(note.id)} title="Jump to highlight" style={{ padding: '3px 6px', border: '1px solid #1E1E1E', background: '#fff', cursor: 'pointer', ...captionStyle, fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <ChevronLeft size={9} /> Jump
                          </button>
                          <button onClick={() => deleteNote(note.id)} style={{ padding: '3px 6px', border: '1px solid #1E1E1E', background: '#fff', cursor: 'pointer', display: 'flex' }}>
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>

                      <div style={{ padding: '10px 12px', borderBottom: '1px solid #1E1E1E' }}>
                        <div style={{ ...captionStyle, fontSize: '9px', fontWeight: 700, marginBottom: '5px' }}>From article</div>
                        <span style={{ background: '#A1D8FF', padding: '2px 4px', ...bodyStyle, fontSize: '11px', lineHeight: 1.5 }}>
                          "{note.sourceText.length > 140 ? note.sourceText.slice(0, 140) + '…' : note.sourceText}"
                        </span>
                      </div>

                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ ...captionStyle, fontSize: '9px', fontWeight: 700, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>My note</span>
                          {editingNoteId !== note.id && (
                            <button onClick={() => { setEditingNoteId(note.id); setEditingText(note.body); }} style={{ padding: '2px 6px', border: '1px solid #1E1E1E', background: '#fff', cursor: 'pointer', ...captionStyle, fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Edit3 size={9} /> Edit
                            </button>
                          )}
                        </div>
                        {editingNoteId === note.id ? (
                          <>
                            <textarea
                              value={editingText} onChange={e => setEditingText(e.target.value)}
                              placeholder="Type or paste a chatbot response here…"
                              style={{ width: '100%', minHeight: '110px', padding: '8px', border: '1px solid #1E1E1E', ...bodyStyle, fontSize: '11px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', background: '#fff', lineHeight: 1.5 }}
                            />
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                              <button onClick={() => { updateNoteBody(note.id, editingText); setEditingNoteId(null); }} style={{ flex: 1, padding: '6px', border: 'none', background: '#1E1E1E', color: '#F7EEE5', cursor: 'pointer', ...captionStyle, fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <Save size={10} /> Save
                              </button>
                              <button onClick={() => setEditingNoteId(null)} style={{ padding: '6px 10px', border: '1px solid #1E1E1E', background: '#fff', cursor: 'pointer', ...captionStyle, fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <X size={10} /> Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <div style={{ ...bodyStyle, fontSize: '11px', lineHeight: 1.6, whiteSpace: 'pre-wrap', minHeight: '24px', color: note.body ? '#1E1E1E' : '#999' }}>
                            {note.body || 'No notes yet — click Edit to add your thoughts.'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}