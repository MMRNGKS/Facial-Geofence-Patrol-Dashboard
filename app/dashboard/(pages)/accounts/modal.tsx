import React, { useState, ChangeEvent, FormEvent } from 'react';
import { getFirestore, doc, setDoc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleAddAccount: (newAccount: any) => Promise<void>; // Add handleAddAccount prop
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [accountName, setAccountName] = useState<string>('');
  const [badgeNumber, setBadgeNumber] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showAlert1, setShowAlert1] = useState<boolean>(false);

  const handleAccountNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAccountName(e.target.value);
  };

  const handleBadgeNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    setBadgeNumber(e.target.value);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedImage(files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!accountName || !badgeNumber || !selectedImage) {
      setShowAlert(true); // Display alert if any field is empty
      return;
    }
  
    // Check if the badge number already exists
    const dbRef = getFirestore();
    const userDocRef = doc(dbRef, 'Users', badgeNumber);
    const docSnapshot: DocumentSnapshot = await getDoc(userDocRef);
    if (docSnapshot.exists()) {
      setShowAlert1(true); // Display alert if the badge number already exists
      setShowAlert(false); // Hide the other alert
      return;
    }
  
    // Upload image to Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `Registered_Faces/${selectedImage.name}`);
    await uploadBytes(storageRef, selectedImage);
  
    // Get download URL of the uploaded image
    const downloadURL = await getDownloadURL(storageRef);
  
    // Store data in Firestore
    const db = getFirestore();
    const newUserDocRef = doc(db, 'Users', badgeNumber);
    await setDoc(newUserDocRef, {
      name: accountName,
      face: downloadURL
    });
  
    // Clear fields
    clearFields();
  
    // Close modal
    onClose();
  };

  const clearFields = () => {
    setAccountName('');
    setBadgeNumber('');
    setSelectedImage(null);
    setShowAlert(false);
    setShowAlert1(false);
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
                <label htmlFor="accountName" className="block text-sm font-medium text-white">Rank & Name</label>
                <input type="text" id="accountName" name="accountName" value={accountName} onChange={handleAccountNameChange} className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="badgeNumber" className="block text-sm font-medium text-white">Badge Number</label>
                <input type="text" id="badgeNumber" name="badgeNumber" value={badgeNumber} onChange={handleBadgeNumberChange} className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-white">Select Profile Image</label>
                <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              {showAlert && (
                <div className="mb-4 text-red-500">Please fill in all fields and select an image.</div>
              )}
              {showAlert1 && (
                <div className="mb-4 text-red-500">The badge number is already used.</div>
              )}
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={handleCancel} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">Cancel</button>
                <button type="submit" className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Register</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;