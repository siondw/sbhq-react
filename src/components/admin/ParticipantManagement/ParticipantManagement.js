// ParticipantManagement.js
import React, { useState } from 'react';

const ParticipantManagement = () => {
  const [participants] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "eliminated" },
  ]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-white mb-4">Participant Management</h2>
      <div className="bg-gray-800 p-4 rounded-md shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Add New Participant</h3>
        <form className="flex gap-4">
          <input 
            type="text" 
            placeholder="Name" 
            className="flex-1 bg-gray-700 text-white p-2 rounded" 
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="flex-1 bg-gray-700 text-white p-2 rounded" 
          />
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
            Add Participant
          </button>
        </form>
      </div>
      <div className="bg-gray-800 rounded-md shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {participants.map((participant) => (
              <tr key={participant.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{participant.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{participant.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    participant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {participant.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParticipantManagement;
