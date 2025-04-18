// components/ContactAdmin.js
"use client";

import React, { useState } from 'react';

const MAX_FILE_SIZE_MB = 2;
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

const ContactAdmin = ({ user = { name: 'Saiful Kabir Chowdhury', email: 'saiful@example.com' } }) => {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    subject: '',
    message: '',
    file: null,
  });
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const file = files[0];
      if (file && !ALLOWED_FILE_TYPES.includes(file.type)) {
        setErrors((prev) => ({ ...prev, file: 'Invalid file type' }));
        return;
      }
      if (file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: 'File too large (max 2MB)' }));
        return;
      }
      setErrors((prev) => ({ ...prev, file: null }));
      setForm({ ...form, file });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.subject) newErrors.subject = 'Subject is required';
    if (!form.message) newErrors.message = 'Message is required';
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setErrors({});
    setToast('✅ Message sent successfully');
    setTimeout(() => setToast(''), 3000);

    // send form to backend (email & db logic to be implemented)
    console.log('Send:', form);
  };

  const resetForm = () => {
    setForm({ name: user.name, email: user.email, subject: '', message: '', file: null });
    setErrors({});
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
            readOnly
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">📧 Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
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

        <div>
          <label className="block font-medium">📎 Attachment (PDF, PNG, JPG)</label>
          <input
            type="file"
            name="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleChange}
            className="block"
          />
          {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📤 Send Message
          </button>
          <button
            type="button"
            className="text-sm text-gray-600 hover:underline"
            onClick={resetForm}
          >
            🔄 Clear Form
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
