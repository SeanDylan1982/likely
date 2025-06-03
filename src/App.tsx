import { useState, useEffect } from 'react';
import { supabase } from './supabase';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function checkConnection() {
      try {
        const { data, error } = await supabase.from('favorites').select('count');
        if (error) throw error;
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting to Supabase:', error);
        setIsConnected(false);
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Status</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="text-lg">
            {isConnected ? 'Connected to Supabase' : 'Not connected to Supabase'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;