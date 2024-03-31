import React, { useState, ChangeEvent, FormEvent } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployment: string;
  fenceRadius: string;
  geofenceId: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, deployment: initialDeployment, fenceRadius: initialFenceRadius, geofenceId }) => {
  const [deployment, setDeployment] = useState<string>(initialDeployment);
  const [fenceRadius, setFenceRadius] = useState<string>(initialFenceRadius);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const handleDeploymentChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeployment(e.target.value);
  };

  const handleFenceRadiusChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFenceRadius(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!deployment || !fenceRadius) {
      setShowAlert(true); // Display alert if any field is empty
      return;
    }
  
    // Update Firestore document
    const db = getFirestore();
    const fenceRef = doc(db, 'Geofences', geofenceId);
    try {
      await updateDoc(fenceRef, {
        deployment,
        radius: fenceRadius
      });
      console.log('Fence updated successfully');
    } catch (error) {
      console.error('Error updating fence:', error);
    }

    // Clear fields
    clearFields();

    // Close modal
    onClose();
  };

  const clearFields = () => {
    setDeployment('');
    setFenceRadius('');
    setShowAlert(false);
  };

  const handleCancel = () => {
    clearFields();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <div className="relative bg-blue-900 rounded-lg overflow-hidden max-w-md mx-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="accountName" className="block text-sm font-medium text-white">Deployment</label>
                <input type="text" id="accountName" name="accountName" value={deployment} onChange={handleDeploymentChange} className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="badgeNumber" className="block text-sm font-medium text-white">Fence Radius In Meters</label>
                <input type="number" id="badgeNumber" name="badgeNumber" value={fenceRadius} onChange={handleFenceRadiusChange} className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              {showAlert && (
                <div className="mb-4 text-red-500">Please fill in all fields.</div>
              )}
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={handleCancel} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
