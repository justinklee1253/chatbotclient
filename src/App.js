import { useState, useEffect, useRef } from 'react';
import { VegaLite } from 'react-vega';

const url = process.env.NODE_ENV === 'production' ? 'https://assignment1humanai.onrender.com/' : 'http://127.0.0.1:8000/';

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'bot', content: 'How can I help you today?' }
  ]);
  const [file, setFile] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [columns, setColumns] = useState([]);
  const [sampleData, setSampleData] = useState([]);

  const chatContainerRef = useRef(null);

  // Scroll to the bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Handle CSV file upload
  function handleFileUpload(e) {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  }

  // Upload the CSV file to the backend
  function uploadCsv() {
    if (!file) {
      alert("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${url}upload-csv`, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.columns) {
          setDataLoaded(true);
          setColumns(data.columns);
          setSampleData(data.sample_data);
          setShowTable(true); // Show table after upload
        } else {
          alert(data.detail);
        }
      })
      .catch(error => {
        alert('Error uploading file');
      });
  }

  // Send a message to the backend for visualization
  function sendMessage() {
    if (message === "") return;

    const newMessage = { type: 'user', content: message };
    setChatHistory([...chatHistory, newMessage]);

    fetch(`${url}query`, {
      method: 'POST',
      body: JSON.stringify({ prompt: message }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        const newResponse = { type: 'bot', content: 'Here is the generated chart.', vegaSpec: null };

        // Set VegaLite spec or add text to chat
        if (data.response) {
          try {
            const vegaSpecParsed = JSON.parse(JSON.stringify(data.response));
            if (vegaSpecParsed) {
              newResponse.vegaSpec = vegaSpecParsed;  // Store Vega-Lite spec as part of the message
            }
          } catch (error) {
            // If not valid JSON, handle as a text response
            newResponse.content = data.response;
          }
        }

        setChatHistory(prevHistory => [...prevHistory, newResponse]);
      })
      .catch(error => {
        const errorMessage = { type: 'bot', content: 'An error occurred while processing your request.' };
        setChatHistory(prevHistory => [...prevHistory, errorMessage]);
      });

    setMessage(''); // Clear the input field after sending
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-4xl w-full flex flex-col">

        {/* File Upload Section */}
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Data Visualization Assistant</h1>
        <div className="border-2 border-dashed border-gray-300 p-6 mb-6 text-center">
          <input type="file" onChange={handleFileUpload} className="mb-4" />
          <button className="btn btn-primary" onClick={uploadCsv}>Upload CSV</button>
        </div>

        {/* Table display section */}
        {dataLoaded && (
          <div className="mb-6">
            <button className="btn btn-secondary mb-4" onClick={() => setShowTable(!showTable)}>
              {showTable ? 'Hide Table' : 'Show Table'}
            </button>
            {showTable && (
              <div className="overflow-x-auto">
                <h2 className="text-xl font-bold mb-4">CSV Data Preview</h2>
                <table className="table-auto w-full text-left">
                  <thead>
                    <tr>
                      {columns.map((col, index) => (
                        <th key={index} className="px-4 py-2 border">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                          <td key={colIndex} className="px-4 py-2 border">{row[col]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Chat history */}
        <div
          ref={chatContainerRef}
          className="flex-grow h-64 max-h-64 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg shadow-inner"
        >
          {chatHistory.map((entry, index) => (
            <div key={index} className={`mb-4 ${entry.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-4 rounded-lg text-lg ${entry.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {entry.content}

                {/* Render Vega-Lite chart if it's part of the bot response */}
                {entry.vegaSpec && (
                  <div className="mt-4" style={{ width: '300px', height: '300px' }}> {/* Fixed chart size */}
                    <VegaLite spec={entry.vegaSpec} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input section */}
        <div className="flex">
          <input
            type="text"
            placeholder="Ask a question about your dataset..."
            value={message}
            className="input input-bordered w-full text-gray-900 text-lg p-4"
            onInput={(e) => setMessage(e.target.value)}
          />
          <button className="btn btn-primary ml-4 text-lg px-6" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
