'use client'
import Map from '@/app/components/Map';
import { useState } from 'react';
import Modal from './modal';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

const Geofences = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Define deleteFence function here
  const deleteFence = async (id: string) => {
    const db = getFirestore();
    const fenceRef = doc(db, 'Geofences', id);
    try {
      await deleteDoc(fenceRef);
      console.log('Fence deleted successfully');
    } catch (error) {
      console.error('Error deleting fence:', error);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold my-4 text-center">Geofence</h1>
      <div className='mx-3 border-blue-600 border-2 shadow-md'>
        <Map deleteFence={deleteFence} /> {/* Pass deleteFence as a prop */}
      </div>
      <div className='flex flex-col items-center'>
        <button onClick={openModal} className="mt-5 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Add Geofence</button>
        <Modal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    </>
  );
};

export default Geofences;
