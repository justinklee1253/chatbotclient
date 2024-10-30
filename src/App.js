import React, { useState, useEffect, useRef } from 'react';

const LoadingSpinner = () => (
  <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
);

const ReActAgent = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I can help you analyze your data and create visualizations. Please upload a CSV file to begin.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showTable, setShowTable] = useState(true);
  const [tableData, setTableData] = useState({ columns: [], sample: [] });
  const chatEndRef = useRef(null);
  const chartIdRef = useRef(0);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const handleVisualization = async (chartSpec, container) => {
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/vega/5.22.1/vega.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/vega-lite/5.6.0/vega-lite.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/vega-embed/6.21.0/vega-embed.min.js');
      
      container.innerHTML = '';
      await window.vegaEmbed(container, chartSpec, {
        actions: false,
        theme: 'light',
        renderer: 'svg'
      });
    } catch (error) {
      console.error('Error rendering chart:', error);
      container.innerHTML = 'Error rendering visualization';
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
  };

  const uploadFile = async (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Please upload a CSV file.'
      }]);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/upload-csv', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      setTableData({ columns: data.columns, sample: data.sample });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Data loaded successfully! I can now help you analyze these columns: ${data.columns.join(', ')}`
      }]);
      setDataLoaded(true);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error loading the file. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !dataLoaded) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });
      const data = await response.json();
      
      let assistantMessage;
      if (typeof data.response === 'object' && !data.response.text) {
        const chartId = `chart-${++chartIdRef.current}`;
        assistantMessage = {
          role: 'assistant',
          content: 'Here is the visualization based on your request:',
          chartSpec: data.response,
          chartId
        };
      } else {
        assistantMessage = {
          role: 'assistant',
          content: data.response.text || 'Here is what I found:'
        };
      }
      
      setMessages(prev => [...prev, assistantMessage]);

      if (assistantMessage.chartSpec) {
        setTimeout(() => {
          const container = document.getElementById(assistantMessage.chartId);
          if (container) {
            handleVisualization(assistantMessage.chartSpec, container);
          }
        }, 100);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([{
      role: 'assistant',
      content: 'Hello! I can help you analyze your data and create visualizations. Please upload a CSV file to begin.'
    }]);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-colors hover:border-blue-500"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            accept=".csv"
            onChange={(e) => uploadFile(e.target.files?.[0])}
            className="mb-2"
          />
          <p className="text-gray-500">Drag and drop a CSV file here or click to upload</p>
        </div>
      </div>

      {dataLoaded && (
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setShowTable(!showTable)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition-colors"
          >
            {showTable ? 'Hide Table Preview' : 'Show Table Preview'}
          </button>
          <button
            onClick={clearMessages}
            className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded transition-colors"
          >
            Clear Messages
          </button>
        </div>
      )}

      {dataLoaded && showTable && (
        <div className="mb-4 overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                {tableData.columns.map((column, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.sample.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {tableData.columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row[column]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex-1 bg-white rounded-lg shadow-sm" style={{ height: '600px' }}>
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-8 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.chartSpec && (
                    <div
                      id={message.chartId}
                      className="mt-4 mb-8 bg-white rounded p-4 shadow-sm"
                      style={{ 
                        width: '500px', 
                        height: '300px',
                        marginBottom: '2rem'
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} className="h-8" />
          </div>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your data..."
                className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!dataLoaded || isLoading}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[80px] flex items-center justify-center transition-colors"
                disabled={!dataLoaded || isLoading}
              >
                {isLoading ? <LoadingSpinner /> : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReActAgent;