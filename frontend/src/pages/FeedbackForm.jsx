import { useState } from 'react';

export default function FeedbackForm() {
  const [form, setForm] = useState({
    mentorId: '',
    internId: '',
    weekStart: '',
    comment: '',
    score: 3
  });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'submit failed');
      setMsg(`✅ Submitted (id: ${data.id})`);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
      <h2>Submit Weekly Feedback</h2>
      <form onSubmit={onSubmit}>
        <label>Mentor ID
          <input name="mentorId" value={form.mentorId} onChange={onChange}/>
        </label>
        <label>Intern ID
          <input name="internId" value={form.internId} onChange={onChange}/>
        </label>
        <label>Week Start
          <input type="date" name="weekStart" value={form.weekStart} onChange={onChange}/>
        </label>
        <label>Comment
          <textarea name="comment" rows={5} value={form.comment} onChange={onChange}/>
        </label>
        <label>Score (1–5)
          <input type="number" name="score" min="1" max="5" value={form.score} onChange={onChange}/>
        </label>
        <button type="submit" disabled={busy}>
          {busy ? 'Submitting…' : 'Submit'}
        </button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
