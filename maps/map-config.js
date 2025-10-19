// OpenStreetMap Configuration for EcoSmart (No API Key Required)
const mapConfig = {
    // Default map center (Panamá City, Panamá)
    defaultCenter: [8.9824, -79.5199], // [lat, lng] format for Leaflet
    
    // Default zoom level
    defaultZoom: 11,
    
    // Sample tank locations in Panamá (replace with real data)
    tankLocations: [
        {
            id: 1,
            name: "Tanque Albrook Mall",
            lat: 8.9756,
            lng: -79.5511,
            status: "full", // full, empty, maintenance
            lastUpdate: "2024-01-15T10:30:00Z",
            capacity: 80
        },
        {
            id: 2,
            name: "Tanque Parque Omar",
            lat: 8.9889,
            lng: -79.5089,
            status: "empty",
            lastUpdate: "2024-01-15T09:15:00Z",
            capacity: 45
        },
        {
            id: 3,
            name: "Tanque Estación Metro",
            lat: 8.9722,
            lng: -79.5333,
            status: "full",
            lastUpdate: "2024-01-15T11:00:00Z",
            capacity: 95
        },
        {
            id: 4,
            name: "Tanque Hospital Santo Tomás",
            lat: 8.9667,
            lng: -79.5167,
            status: "maintenance",
            lastUpdate: "2024-01-15T08:45:00Z",
            capacity: 0
        },
        {
            id: 5,
            name: "Tanque Universidad de Panamá",
            lat: 8.9556,
            lng: -79.5389,
            status: "empty",
            lastUpdate: "2024-01-15T07:30:00Z",
            capacity: 20
        },
        {
            id: 6,
            name: "Tanque Casco Viejo",
            lat: 8.9517,
            lng: -79.5333,
            status: "full",
            lastUpdate: "2024-01-15T12:00:00Z",
            capacity: 75
        },
        {
            id: 7,
            name: "Tanque Aeropuerto Tocumen",
            lat: 9.0667,
            lng: -79.3833,
            status: "empty",
            lastUpdate: "2024-01-15T06:30:00Z",
            capacity: 30
        }
    ],
    
    // Collection routes in Panamá (sample data)
    collectionRoutes: [
        {
            id: 1,
            name: "Ruta Centro",
            color: "#FF6F00",
            waypoints: [
                [8.9756, -79.5511],
                [8.9889, -79.5089],
                [8.9722, -79.5333]
            ]
        },
        {
            id: 2,
            name: "Ruta Histórica",
            color: "#1565C0",
            waypoints: [
                [8.9517, -79.5333],
                [8.9556, -79.5389],
                [8.9667, -79.5167]
            ]
        },
        {
            id: 3,
            name: "Ruta Aeropuerto",
            color: "#4CAF50",
            waypoints: [
                [9.0667, -79.3833],
                [8.9824, -79.5199]
            ]
        }
    ]
};

// Map initialization function using Leaflet (OpenStreetMap)
function initializeSmartBinMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Map element not found');
        return;
    }

    // Create map using Leaflet
    const map = L.map('map').setView(mapConfig.defaultCenter, mapConfig.defaultZoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Create custom icons for different tank statuses
    const createCustomIcon = (status) => {
        const color = getStatusColor(status);
        const letter = getStatusLetter(status);
        
        return L.divIcon({
            className: 'custom-tank-marker',
            html: `
                <div style="
                    width: 32px; 
                    height: 32px; 
                    background: ${color}; 
                    border: 2px solid white; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    font-size: 12px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                ">
                    ${letter}
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    };

    // Create markers for tank locations
    const markers = [];
    const popups = [];

    mapConfig.tankLocations.forEach(tank => {
        const marker = L.marker([tank.lat, tank.lng], {
            icon: createCustomIcon(tank.status)
        }).addTo(map);

        const popup = L.popup({
            maxWidth: 250,
            className: 'tank-popup'
        }).setContent(`
            <div style="padding: 5px;">
                <h3 style="margin: 0 0 10px 0; color: #2E7D32; font-size: 16px;">${tank.name}</h3>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Estado:</strong> 
                    <span style="color: ${getStatusColor(tank.status)}">${getStatusText(tank.status)}</span>
                </p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Capacidad:</strong> ${tank.capacity}%</p>
                <p style="margin: 5px 0; font-size: 14px;"><strong>Última actualización:</strong><br>${formatDate(tank.lastUpdate)}</p>
                <div style="margin-top: 10px;">
                    <button onclick="requestCollection(${tank.id})" 
                            style="background: #2E7D32; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Solicitar Recolección
                    </button>
                </div>
            </div>
        `);

        marker.bindPopup(popup);
        markers.push(marker);
        popups.push(popup);
    });

    // Create collection routes
    const routes = [];
    mapConfig.collectionRoutes.forEach(route => {
        const polyline = L.polyline(route.waypoints, {
            color: route.color,
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(map);

        // Add route label
        const midPoint = route.waypoints[Math.floor(route.waypoints.length / 2)];
        L.marker(midPoint, {
            icon: L.divIcon({
                className: 'route-label',
                html: `<div style="
                    background: ${route.color}; 
                    color: white; 
                    padding: 2px 8px; 
                    border-radius: 12px; 
                    font-size: 12px; 
                    font-weight: bold;
                    white-space: nowrap;
                ">${route.name}</div>`,
                iconSize: [100, 20],
                iconAnchor: [50, 10]
            })
        }).addTo(map);

        routes.push(polyline);
    });

    // Store map instance globally for other functions
    window.ecosmartMap = map;
    window.ecosmartMarkers = markers;
    window.ecosmartRoutes = routes;

    return map;
}

// Helper functions
function getStatusColor(status) {
    const colors = {
        full: '#f44336',
        empty: '#4CAF50',
        maintenance: '#FF9800'
    };
    return colors[status] || '#666';
}

function getStatusText(status) {
    const texts = {
        full: 'Lleno',
        empty: 'Vacío',
        maintenance: 'Mantenimiento'
    };
    return texts[status] || 'Desconocido';
}

function getStatusLetter(status) {
    const letters = {
        full: 'F',
        empty: 'V',
        maintenance: 'M'
    };
    return letters[status] || '?';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Request collection function
function requestCollection(tankId) {
    const tank = mapConfig.tankLocations.find(t => t.id === tankId);
    if (tank) {
        alert(`Solicitud de recolección enviada para: ${tank.name}\n\nEsta es una demostración. En una implementación real, esto enviaría una notificación al sistema de gestión.`);
    }
}

// Update map display based on controls
function updateMapDisplay() {
    if (!window.ecosmartMap || !window.ecosmartMarkers) return;

    const showFull = document.getElementById('show-full')?.checked;
    const showEmpty = document.getElementById('show-empty')?.checked;
    const showRoutes = document.getElementById('show-routes')?.checked;

    // Show/hide markers based on status
    window.ecosmartMarkers.forEach((marker, index) => {
        const tank = mapConfig.tankLocations[index];
        let shouldShow = false;

        if (tank.status === 'full' && showFull) shouldShow = true;
        if (tank.status === 'empty' && showEmpty) shouldShow = true;
        if (tank.status === 'maintenance') shouldShow = true; // Always show maintenance

        if (shouldShow) {
            marker.addTo(window.ecosmartMap);
        } else {
            marker.remove();
        }
    });

    // Show/hide routes
    if (window.ecosmartRoutes) {
        window.ecosmartRoutes.forEach(route => {
            if (showRoutes) {
                route.addTo(window.ecosmartMap);
            } else {
                route.remove();
            }
        });
    }
}

// Export for global access
window.mapConfig = mapConfig;
window.initializeSmartBinMap = initializeSmartBinMap;
window.updateMapDisplay = updateMapDisplay;
window.requestCollection = requestCollection;
