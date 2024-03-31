import { useEffect, useRef, useState } from "react";
import Script from 'next/script';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { getFirestore, collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import React, { useCallback } from "react";
import Modal from './modal1';

// Declare the deleteFence function on the Window interface
declare global {
    interface Window {
        deleteFence: (id: string) => void;
    }
}

interface Geofence {
    id: string;
    deployment: string;
    address: string;
    radius: string;
    location: {
        latitude: number;
        longitude: number;
    };
}

interface MapProps {
    deleteFence: (id: string) => void;
}

const MyMap = React.memo(({ deleteFence }: MapProps) => {
    const mapContainerRef = useRef(null);
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const db = getFirestore();
        const geofencesCollection = collection(db, 'Geofences');

        const unsubscribe = onSnapshot(geofencesCollection, (snapshot) => {
            const fetchedGeofences = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Geofence[]; // Type assertion
            setGeofences(fetchedGeofences);
        });

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
        window.deleteFence = deleteFence;

        return () => {
            unsubscribe(); // Unsubscribe from real-time updates when component unmounts
        };
    }, []);

    const openModal = useCallback((geofence: Geofence) => {
        setSelectedGeofence(geofence);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedGeofence(null);
    }, []);

    useEffect(() => {
        if (!mapContainerRef.current) return;
    
        const map = L.map(mapContainerRef.current).setView([8.478491946468438, 124.64200829540064], 16);
    
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    
        geofences.forEach(geofence => {
            const { location, radius, id } = geofence;
            const { latitude, longitude } = location;
    
            const popupContent = `
                <div>
                    <p><b>Deployment:</b> ${geofence.deployment}</p>
                    <p><b>Address:</b> ${geofence.address}</p>
                    <p><b>Fence Radius:</b> ${geofence.radius}m</p>
                    <button id="showModalBtn_${id}" class="mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Edit</button>
                    <button id="deleteBtn_${id}" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</button>
                </div>
            `;
    
            const circle = L.circle([latitude, longitude], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: parseInt(radius)
            }).addTo(map);
    
            circle.bindPopup(popupContent);
    
            circle.on('popupopen', () => {
                const editBtn = document.getElementById(`showModalBtn_${id}`);
                if (editBtn) {
                    editBtn.addEventListener('click', () => openModal(geofence));
                }
    
                const deleteBtn = document.getElementById(`deleteBtn_${id}`);
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => window.deleteFence(id));
                }
            });
        });
    
        return () => {
            map.remove();
        };
    }, [geofences, openModal]);

    return (
        <div style={{ height: "550px" }}>
            <Script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
                integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                crossOrigin=""
            />
            <div ref={mapContainerRef} style={{ height: "550px", width: "100%", position: 'relative', zIndex: 1 }}></div>
            {selectedGeofence && <Modal isOpen={true} onClose={closeModal} deployment={selectedGeofence.deployment} fenceRadius={selectedGeofence.radius} geofenceId={selectedGeofence.id} />}
        </div>
    );
});

export default MyMap;
