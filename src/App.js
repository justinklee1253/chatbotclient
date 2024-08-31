import { useState } from 'react';

const url = process.env.NODE_ENV === 'production' ? 'https://course-tools-demo.onrender.com/' : 'http://127.0.0.1:8000/';

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'bot', content: 'How can I help you today?' }
  ]);

  function sendMessage() {
    if (message === "") { 
      return;
    }

    const newMessage = { type: 'user', content: message };
    setChatHistory([...chatHistory, newMessage]);

    fetch(`${url}query`, {
      method: 'POST',
      body: JSON.stringify({ prompt: message }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
      .then(data => {
        const newResponse = { type: 'bot', content: data.response };
        setChatHistory(prevHistory => [...prevHistory, newResponse]);
      })
      .catch(error => {
        const errorMessage = { type: 'bot', content: 'An error occurred while processing your request.' };
        setChatHistory(prevHistory => [...prevHistory, errorMessage]);
      });

    setMessage(''); // Clear the input field after sending
  }

  function handleMessage(e) {
    setMessage(e.target.value);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-2xl w-full">
        <h1 className="text-5xl font-bold text-center mb-8 text-gray-800">EagleTech Support</h1>
        
        <div className="h-[500px] overflow-y-scroll mb-6 p-6 bg-gray-50 rounded-lg shadow-inner">
          {chatHistory.map((entry, index) => (
            <div key={index} className={`mb-4 ${entry.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-4 rounded-lg text-lg ${entry.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {entry.content}
              </div>
            </div>
          ))}
        </div>

        <div className="flex">
          <input
            type="text"
            placeholder="Ask for tech support ..."
            value={message}
            className="input input-bordered w-full text-gray-900 text-xl p-4"
            onInput={handleMessage}
          />
          <button className="btn btn-primary ml-4 text-xl px-8" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;