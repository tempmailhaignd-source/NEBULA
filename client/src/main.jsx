import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    const [name, setName] = useState('');
    const [started, setStarted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetch('/api/session', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (data.authenticated && data.name) {
                    setName(data.name);
                    setStarted(true);
                    setMessages([{ role: 'assistant', content: 'NEBULA REACTIVATED. Welcome back.' }]);
                }
            });
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const startChat = async (e) => {
        e.preventDefault();
        if (name.trim()) {
            await fetch('/api/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name })
            });
            setStarted(true);
            setMessages([{ role: 'assistant', content: `NEBULA ACTIVATED. Welcome, ${name}. No limits. Ask anything.` }]);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ prompt: input })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'No response.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'AI server down.' }]);
        }
        setLoading(false);
    };

    if (!started) {
        return (
            <div className="login"><div className="login-box">
                <h1>NEBULA</h1>
                <form onSubmit={startChat}>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ENTER YOUR IDENTITY..." autoFocus />
                    <button type="submit">INITIALIZE</button>
                </form>
            </div></div>
        );
    }

    return (
        <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'#0a0000' }}>
            <div className="header">
                <div><h1>NEBULA</h1> <span className="user">{name.toUpperCase()}</span> <span style={{color:'#ff000040',fontSize:'0.5rem',letterSpacing:'2px'}}>[ UNRESTRICTED ]</span></div>
                <button onClick={() => { document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; window.location.reload(); }} style={{background:'transparent',color:'#ff3333',border:'1px solid #ff000040',borderRadius:'0.3rem',padding:'0.3rem 0.8rem',cursor:'pointer',fontFamily:'Courier New,monospace'}}>LOGOUT</button>
            </div>
            <div className="messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>{msg.content}</div>
                ))}
                {loading && <div style={{color:'#ff0000',fontSize:'0.7rem'}}>THINKING...</div>}
                <div ref={messagesEndRef} />
            </div>
            <form className="input-area" onSubmit={sendMessage}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="ASK ANYTHING - NO LIMITS..." disabled={loading} />
                <button type="submit" disabled={loading}>SEND</button>
            </form>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
