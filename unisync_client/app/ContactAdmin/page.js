"use client";

import React, { useState } from 'react';

const ContactAdmin = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.subject) newErrors.subject = 'Subject is required';
    if (!form.message) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);
    setErrors({});

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      console.log(form)

      if (res.ok) {
        setToast('✅ Message sent successfully');
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setToast(''), 3000);
      } else {
        setToast('❌ Failed to send message');
        setTimeout(() => setToast(''), 3000);
      }
    } catch (error) {
      setToast('❌ Error sending message');
      setTimeout(() => setToast(''), 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-[#FFFFFF20] rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-bold text-center mb-4">Contact Admin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">🧑 Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label className="block font-medium">📧 Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <label className="block font-medium">🏷️ Subject</label>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
        </div>

        <div>
          <label className="block font-medium">📝 Message</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows="5"
            className="w-full p-2 border rounded"
          />
          {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📤 Send Message
          </button>
        </div>

        {toast && (
          <div className="text-center mt-4 text-green-700 font-medium">{toast}</div>
        )}
      </form>
    </div>
  );
};

export default ContactAdmin;
