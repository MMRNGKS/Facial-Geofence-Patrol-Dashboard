'use client'
import Modal from './modal';
import { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, doc, deleteDoc, addDoc } from 'firebase/firestore';
import EditModal from './modal1'; // Import the edit modal component

const Accounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // State for delete modal
  const [deleteAccount, setDeleteAccount] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);

  const fetchAccounts = async () => {
    const db = getFirestore();
    const accountsCollection = collection(db, 'Users');
    const accountsSnapshot = await getDocs(accountsCollection);
    const accountsData = accountsSnapshot.docs.map(doc => ({ id: doc.id, badgeNumber: doc.id, ...doc.data() }));
    setAccounts(accountsData);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchAccounts(); // Refresh account data after closing modal
  };

  const openEditModal = (account: any) => {
    setEditAccount(account);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    fetchAccounts(); // Refresh account data after closing edit modal
  };

  const openDeleteModal = (account: any) => {
    setDeleteAccount(account);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (deleteAccount) {
      const db = getFirestore();
      const accountRef = doc(db, 'Users', deleteAccount.badgeNumber);
      await deleteDoc(accountRef);
      await fetchAccounts(); // Refresh account data after deletion
      closeDeleteModal();
    }
  };

  const handleAddAccount = async (newAccount: any) => {
    const db = getFirestore();
    await addDoc(collection(db, 'Users'), newAccount);
    await fetchAccounts(); // Refresh account data after adding account
    closeModal();
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold my-4">Registered Accounts</h1>
      <div className="w-full max-w-4xl h-[550px] overflow-y-auto bg-white shadow-md rounded-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-indigo-600 text-white sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left w-1/4">Badge Number</th>
              <th className="px-6 py-3 text-left w-1/4">Rank & Name</th>
              <th className="px-6 py-3 text-left w-1/4">Profile Image</th>
              <th className="px-6 py-3 text-left w-1/4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
              {accounts.map(account => (
                <tr key={account.id}>
                  <td className="px-8 py-2 w-1/4">{account.badgeNumber}</td>
                  <td className="max-w-0 px-8 py-2">{account.name}</td>
                  <td className="px-8 py-2 w-1/4">
                    <img src={account.face} alt="Profile" className="mx-6 h-12 w-12 rounded-full" />
                  </td>
                  <td className="px-6 py-2 w-1/4">
                    <button onClick={() => openEditModal(account)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onClick={() => openDeleteModal(account)} className="ml-4 text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} handleAddAccount={handleAddAccount} />
      {/* Render the edit modal */}
      {editModalOpen && <EditModal isOpen={editModalOpen} onClose={closeEditModal} account={editAccount} />}
      {/* Delete confirmation modal */}
      <div className={`fixed z-10 inset-0 overflow-y-auto ${deleteModalOpen ? 'block' : 'hidden'}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <div className="relative bg-blue-900 rounded-lg overflow-hidden max-w-md mx-auto">
            <div className="p-6">
              <p className="text-white">Are you sure you want to delete this account?</p>
              <div className="mt-4 flex justify-end">
                <button onClick={closeDeleteModal} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button onClick={openModal} className="mt-5 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">Add Account</button>
    </div>
  );
};

export default Accounts;