import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: any; // Account details to edit
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, account }) => {
  const [accountName, setAccountName] = useState<string>('');
  const [badgeNumber, setBadgeNumber] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Populate fields with existing account data when the modal is opened for editing
  useEffect(() => {
    if (isOpen && account) {
      setAccountName(account.name);
      setBadgeNumber(account.badgeNumber);
    }
  }, [isOpen, account]);

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
  
    if (!accountName || !badgeNumber) {
      setShowAlert(true); // Display alert if any required field is empty
      return;
    }
  
    let downloadURL = ''; // Initialize downloadURL variable
  
    // Check if an image is selected
    if (selectedImage) {
      // Upload image to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `Registered_Faces/${selectedImage.name}`);
      await uploadBytes(storageRef, selectedImage);
  
      // Get download URL of the uploaded image
      downloadURL = await getDownloadURL(storageRef);
    }
  
    // Update account data in Firestore
    const db = getFirestore();
    const accountRef = doc(db, 'Users', badgeNumber); // Assuming 'Users' is the collection name
    const accountData: any = { name: accountName };
    
    // Only add face field to accountData if downloadURL is not empty
    if (downloadURL !== '') {
      accountData.face = downloadURL;
    }
  
    await updateDoc(accountRef, accountData);
  
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
                <input type="text" id="badgeNumber" name="badgeNumber" value={badgeNumber} onChange={handleBadgeNumberChange} className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" disabled /> {/* Disable editing of badgeNumber */}
              </div>
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium text-white">Change Profile Image</label>
                <input type="file" id="image" name="image" accept="image/*" onChange={handleImageChange} className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              {showAlert && (
                <div className="mb-4 text-red-500">Please fill in all fields and select an image.</div>
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
