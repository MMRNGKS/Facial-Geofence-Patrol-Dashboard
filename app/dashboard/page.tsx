'use client'
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface Log {
  id: string;
  badgeNumber: string;
  name: string;
  deployment: string;
  status: string;
  timestamp: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  // Add other fields as needed
}

const Dashboard = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [sortField, setSortField] = useState<keyof Log | null>(null);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const db = getFirestore();
    const logsCollection = collection(db, 'Logs');
    
    const unsubscribe = onSnapshot(logsCollection, (snapshot) => {
      const logsData: Log[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp.toDate();
        return {
          id: doc.id,
          badgeNumber: data.badgeNumber,
          name: data.name,
          deployment: data.deployment,
          status: data.status,
          timestamp: timestamp.toLocaleString(),
          address: data.address,
          location: data.location,
        };
      });
      setLogs(logsData);
    });
  
    // Set default sorting to timestamp in ascending order
    setSortField('timestamp');
    setSortOrder('desc');
  
    return () => unsubscribe();
  }, []);

  const handleSort = (field: keyof Log) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const sortedLogs = logs.sort((a, b) => {
    if (sortField) {
      if (sortField === 'location') {
        const aValue = a.location.latitude;
        const bValue = b.location.latitude;
        if (aValue < bValue) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortOrder === 'asc' ? 1 : -1;
        }
      } else if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
        // Convert strings to lowercase before comparison
        const aValue = a[sortField].toLowerCase();
        const bValue = b[sortField].toLowerCase();
        if (aValue < bValue) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortOrder === 'asc' ? 1 : -1;
        }
      } else {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (aValue < bValue) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortOrder === 'asc' ? 1 : -1;
        }
      }
    }
    return 0;
  });

  const renderLogs = () => {
    return sortedLogs.map(log => (
      <tr key={log.id}>
        <td className="px-4 py-2">{log.badgeNumber}</td>
        <td className="px-4 py-2">{log.name}</td>
        <td className="px-4 py-2">{log.deployment}</td>
        <td className="px-4 py-2">{log.status}</td>
        <td className="px-4 py-2">{log.timestamp}</td>
        <td className="px-4 py-2">{log.address}</td>
        <td className="px-4 py-2">{`${log.location.latitude}, ${log.location.longitude}`}</td>
        {/* Render location here */}
      </tr>
    ));
  };

  const exportToCsv = () => {
    // Generate CSV content
    const csvContent = [
      'Badge Number,Name,Deployment,Status,Timestamp,Address,Coordinates',
      ...sortedLogs.map(log => {
        // Format timestamp
        const formattedTimestamp = new Date(log.timestamp).toLocaleString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true // to display in 12-hour clock format with AM/PM
        }).replace(',', '');
        // Format address
        const formattedAddress = `${log.address}`;
        // Format coordinates
        const formattedCoordinates = `${log.location.latitude}, ${log.location.longitude}`;
        return `${log.badgeNumber},${log.name},${log.deployment},${log.status},${formattedTimestamp},"${formattedAddress}","${formattedCoordinates}"`;
      })
    ].join('\n');
  
    // Create a blob with the CSV content using UTF-8 encoding
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8' }); // Specify UTF-8 encoding
    const url = window.URL.createObjectURL(blob);
  
    // Create a link element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold my-4">Attendance Logs</h1>
      <div className='w-full max-w-[1200px] h-[550px] overflow-y-auto bg-white shadow-md rounded-md overflow-hidden'>
        <table className="w-full">
          <thead className="bg-indigo-600 text-white sticky top-0">
            <tr>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('badgeNumber')}>
                Badge Number {sortField === 'badgeNumber' && (
                  <span className="absolute ml-1 text-xl">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (
                  <span className="absolute ml-1 text-xl">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('deployment')}>
                Deployment {sortField === 'deployment' && (
                  <span className="absolute ml-1 text-xl">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (
                  <span className="absolute ml-1 text-xl">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('timestamp')}>
                Timestamp {sortField === 'timestamp' && (
                  <span className="absolute ml-1 text-xl">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('address')}>
                Address {sortField === 'address' && (
                  <span className="absolute ml-1 text-xl">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('location')}>
                Coordinates {sortField === 'location' && (
                  <span className="absolute ml-1 text-xl">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              {/* Add table header for location here */}
            </tr>
          </thead>
          <tbody>
              {renderLogs()}
            </tbody>
        </table>
      </div>
      <button className="mt-5 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={exportToCsv}>
        Export to CSV
      </button>
    </div>
  );
};

export default Dashboard;