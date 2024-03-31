import React, { useEffect, useRef, useState } from "react";
import Script from 'next/script';
import L, { LatLngExpression, Marker } from 'leaflet';
import "leaflet/dist/leaflet.css";

interface MapProps {
    onLatLngChange: (latlng: [number, number], address: string) => void;
    fenceRadius: string;
}

const MyMap = ({ onLatLngChange, fenceRadius }: MapProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<Marker<any> | null>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const [circleRadius, setCircleRadius] = useState<number>(10); // Initialize with default radius

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const map = L.map(mapContainerRef.current).setView([8.478491946468438, 124.64200829540064] as LatLngExpression, 15); // Adjust the zoom level here
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Add a click event listener to the map
        map.on('click', async function(e) {
            const latlng = e.latlng;
            // Remove existing marker if present
            if (markerRef.current) {
                markerRef.current.setLatLng(latlng);
            } else {
                const customIcon = L.icon({
                    iconUrl: "/marker.ico",
                    iconSize: [25, 25], // Size of the icon
                    iconAnchor: [12.5, 25], // Point of the icon which corresponds to the marker's location
                    popupAnchor: [1, -25] // Point from which the popup should open relative to the iconAnchor
                });
        
                // Create a new marker at the clicked location
                const newMarker: Marker<any> = L.marker(latlng, { icon: customIcon }).addTo(map);
                markerRef.current = newMarker; // Update the marker ref
            }

            // Create a circle centered at the clicked location
            if (circleRef.current) {
                circleRef.current.setLatLng(latlng);
            } else {
                const newCircle = L.circle(latlng, {
                    color: 'red',
                    fillColor: '#f03',
                    fillOpacity: 0.5,
                    radius: circleRadius // Set radius using state variable
                }).addTo(map);
                circleRef.current = newCircle; // Update the circle ref
            }
        
            // Perform reverse geocoding
            try {
                const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latlng.lat}&lon=${latlng.lng}&apiKey=bbf99e971ea647dfbc31c47711dc28f6`);
                if (!response.ok) {
                    throw new Error('Failed to fetch address');
                }
                const result = await response.json();
                let address = '';
                if (result.features.length) {
                    address = result.features[0].properties.formatted;
                } else {
                    address = 'No address found';
                }
        
                // Update marker popup content
                if (markerRef.current) {
                    markerRef.current.bindPopup(`<b>Address:</b> ${address}`).openPopup();
                }
        
                // Convert LatLng to tuple and pass to the parent component
                const latLngTuple: [number, number] = [latlng.lat, latlng.lng];
                onLatLngChange(latLngTuple, address);
            } catch (error) {
                console.error('Error fetching address:', error);
                // Handle the error, maybe set a default address or show an error message
            }
        });        

        return () => {
            map.remove();
        };
    }, []); // Empty dependency array to run once on mount

    useEffect(() => {
        // Update circle radius when fenceRadius changes
        const radius = parseInt(fenceRadius);
        setCircleRadius(isNaN(radius) ? 10 : radius); // Set radius to fenceRadius if it's a valid number, otherwise default to 100
        if (circleRef.current) {
            circleRef.current.setRadius(isNaN(radius) ? 10 : radius);
        }
    }, [fenceRadius]);

    return (
        <div style={{ height: "400px", width: "400px" }}>
            <Script src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossOrigin=""
            />
            <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }}></div>
        </div>
    );
};

export default MyMap;