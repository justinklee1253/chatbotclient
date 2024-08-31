// import { useState } from 'react';

// const url = process.env.NODE_ENV === 'production' ? 'https://course-tools-demo.onrender.com/' : 'http://127.0.0.1:8000/';

// function App() {
//   const [message, setMessage] = useState('');
//   const [response, setResponse] = useState('This is a test.');

//   function sendMessage() {
//     if (message === "") { 
//       return;
//     }
//     fetch(`${url}query`, {
//       method: 'POST',
//       body: JSON.stringify({ prompt: message }),
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     }).then(response => response.json())
//       .then(data => {
//         setResponse(data.response);
//       })
//       .catch(error => {
//         setResponse('An error occurred while processing your request.');
//       });
//     setMessage('');
//   }

//   function handleMessage(e) {
//     setMessage(e.target.value);
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
//         <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">EagleTech Support</h1>
//         <div className="flex mb-6">
//           <input
//             type="text"
//             placeholder="Ask for tech support ..."
//             value={message}
//             className="input input-bordered w-full text-gray-900 text-lg p-4"
//             onInput={handleMessage}
//           />
//           <button className="btn btn-primary ml-4 text-lg px-6" onClick={sendMessage}>Send</button>
//         </div>
//         <div className="bg-gray-50 p-6 rounded-lg shadow-inner mt-6">
//           <h2 className="text-2xl font-semibold mb-4 text-gray-700">Response</h2>
//           <div className="text-gray-600 flex items-center text-lg">
//             <span className="mr-2">🤖</span> {response}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

import { useState } from 'react';

const url = process.env.NODE_ENV === 'production' ? 'https://course-tools-demo.onrender.com/' : 'http://127.0.0.1:8000/';

function App() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  function sendMessage() {
    if (message === "") { 
      return;
    }
    fetch(`${url}query`, {
      method: 'POST',
      body: JSON.stringify({ prompt: message }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
      .then(data => {
        setResponse(data.response);
      })
      .catch(error => {
        setResponse('An error occurred while processing your request.');
      });
    setMessage('');
  }

  function handleMessage(e) {
    setMessage(e.target.value);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">EagleTech Support</h1>
        <div className="flex mb-6">
          <input
            type="text"
            placeholder="Ask for tech support ..."
            value={message}
            className="input input-bordered w-full text-gray-900 text-lg p-4"
            onInput={handleMessage}
          />
          <button className="btn btn-primary ml-4 text-lg px-6" onClick={sendMessage}>Send</button>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mt-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Response</h2>
          <div className="text-gray-600 flex items-start text-lg whitespace-pre-line">
            <span className="mr-2">🦅</span>
            <span>{response}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;