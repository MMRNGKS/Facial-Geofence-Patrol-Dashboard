// Existing imports...
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import Map from '@/app/components/Map1'
import { GeoPoint } from 'firebase/firestore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [deployment, setDeployment] = useState<string>('');
  const [fenceRadius, setFenceRadius] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<GeoPoint | null>(null);
  const [address, setAddress] = useState('');

  const handleDeploymentChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeployment(e.target.value);
  };

  const handleFenceRadiusChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFenceRadius(e.target.value);
  };

  const handleLatLngChange = (latlng: [number, number], address: string) => {
    // Convert latlng tuple to GeoPoint
    const geoPoint = new GeoPoint(latlng[0], latlng[1]);
    setCoordinates(geoPoint);
    setAddress(address); // Set the address in the state
    setFenceRadius('10');
};

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!deployment || !fenceRadius || !coordinates || !address) {
      setShowAlert(true); // Display alert if any field is empty
      return;
    }
  
    // Store data in Firestore
    const db = getFirestore();
    const userCollectionRef = collection(db, 'Geofences');
    const userDocRef = doc(userCollectionRef); // Generate a new unique document reference
    await setDoc(userDocRef, {
    deployment: deployment,
    radius: fenceRadius,
    location: coordinates,
    address: address,
    });

  
    // Clear fields
    clearFields();

    // Close modal
    onClose();
  };

  const clearFields = () => {
    setDeployment('');
    setFenceRadius('');
    setCoordinates(null);
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
            <div className="mb-4">
              <Map onLatLngChange={handleLatLngChange} fenceRadius={fenceRadius} />
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="deployment" className="block text-sm font-medium text-white">Assign Deployment</label>
                <input type="text" id="deployment" name="deployment" value={deployment} onChange={handleDeploymentChange} className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="fenceRadius" className="block text-sm font-medium text-white">Fence Radius In Meters</label>
                <input type="number" id="fenceRadius" name="fenceRadius" disabled={!coordinates} value={fenceRadius} onChange={handleFenceRadiusChange} className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              {showAlert && (
                <div className="mb-4 text-red-500">Please select location and fill in all fields.</div>
              )}
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={handleCancel} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Submit</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
