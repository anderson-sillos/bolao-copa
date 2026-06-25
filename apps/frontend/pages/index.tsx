'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('Loading...');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
      })
      .catch(() => {
        setMessage('Failed to fetch message from API.');
      });
  }, [apiUrl]);

  return (
    <div>
      <h1>Bolão da Copa 2026</h1>
      <p>
        Message from backend: <strong>{message}</strong>
      </p>
    </div>
  );
}
