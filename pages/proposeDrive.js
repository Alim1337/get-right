import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import mapboxgl from 'mapbox-gl';
import { accessToken } from '../components/Map';
import tw from "tailwind-styled-components";
import Link from "next/link";
import {
  BsArrowLeft,

} from "react-icons/bs";

import { Toaster, toast } from 'sonner'

const ProposeDrive = () => {
  const router = useRouter();
  const [userId, setUserId] = useState('');

  const [seatError, setSeatError] = useState('');
  const [dateError, setDateError] = useState('');
  const [rideDetails, setRideDetails] = useState({
    departure: '',
    destination: '',
    date: '',
    time: '',
    seatsAvailable: 0,
  });
  const [pickup, setPickup] = useState({
    coordinates: [0, 0],
    locationName: "",
  });
  const [dropoff, setDropoff] = useState({
    coordinates: [0, 0],
    locationName: "",
  });
  const [map, setMap] = useState(null);
  const [line, setLine] = useState(null);
  const myPosition = [0, 0];


  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      const watchId = navigator.geolocation.watchPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );

      setTimeout(() => navigator.geolocation.clearWatch(watchId), 5000);
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    setUserId(decodedToken.userId);
    console.log('this is decodedToken', decodedToken);
  }, []);



  const setupMap = async () => {
    mapboxgl.accessToken = accessToken;

    try {
      const position = await getCurrentLocation();
      const currentLocation = {
        coordinates: [position.coords.longitude, position.coords.latitude],
        locationName: await reverseGeocode(
          position.coords.latitude,
          position.coords.longitude
        ),
      };
      setPickup(currentLocation);
      setupMapWithPickup(currentLocation);
      myPosition = currentLocation.coordinates;
    } catch (error) {
      console.error("Error getting current location:", error);
      setupMapWithPickup({
        coordinates: [0, 0],
        locationName: "Unknown Location",
      });
    }
  };
  const setupMapWithPickup = (pickupLocation) => {
    const addPickupMarker = (lngLat, locationName) => {
      if (map) {
        new mapboxgl.Marker({ color: "green" })
          .setLngLat(lngLat)
          .setPopup(new mapboxgl.Popup().setHTML(locationName))
          .addTo(map);
      }
    };

    const newMap = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: pickupLocation.coordinates,
      zoom: 12,
    });

    // Add marker for current position
    new mapboxgl.Marker({ color: "green" })
      .setLngLat(pickupLocation.coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(pickupLocation.locationName))
      .addTo(newMap);

    // Add marker for Pickup Location
    addPickupMarker(pickupLocation.coordinates, pickupLocation.locationName);

    let previousMarker = null;

    newMap.on("dblclick", async (event) => {
      const lngLat = event.lngLat.toArray();
      const locationName = await reverseGeocode(lngLat[1], lngLat[0]);
      setDropoff({ coordinates: lngLat, locationName });

      if (previousMarker) {
        previousMarker.remove();
      }

      const destinationMarker = new mapboxgl.Marker({ color: "orange" })
        .setLngLat(lngLat)
        .addTo(newMap);
      const popup = new mapboxgl.Popup({ offset: 25 }) // Adjust offset as needed
        .setHTML(locationName)
        .addTo(newMap);

      destinationMarker.setPopup(popup); // Associate popup with marker

      // Open the popup immediately after creating the marker
      popup.addTo(newMap);

      previousMarker = destinationMarker;

      drawOrUpdateLine(myPosition, lngLat, newMap);


      // Add marker for destination location
      // addDropoffMarker(lngLat, locationName);

      // drawLine();
    });

    setMap(newMap);
  };


  const drawOrUpdateLine = (startCoords, endCoords, map) => {
    const lineCoordinates = [startCoords, endCoords];
    console.log('lineCoordinates', lineCoordinates);

    if (map.getSource('route')) {
      map.getSource('route').setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: lineCoordinates,
        },
      });
    } else {
      // Create a new source and layer
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: lineCoordinates,
          },
        },
      });

      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': 'orange',  // Customize line color
          'line-width': 4,       // Customize line width
        },
      });
    }
  };


  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}`
      );
      const data = await response.json();
      const locationName = data.features[0]?.place_name || "Unknown Location";
      return locationName;
    } catch (error) {
      console.error("Error fetching reverse geocoding:", error);
      return "Unknown Location";
    }
  };

  const addPickupMarker = (lngLat, locationName) => {
    if (map) {
      new mapboxgl.Marker({ color: "green" })
        .setLngLat(lngLat)
        .setPopup(new mapboxgl.Popup().setHTML(locationName))
        .addTo(map);
    }
  };

  // const addDropoffMarker = (lngLat, locationName) => {
  //   if (map) {
  //     new mapboxgl.Marker({ color: "blue" })
  //       .setLngLat(lngLat)
  //       .setPopup(new mapboxgl.Popup().setHTML(locationName))
  //       .addTo(map);
  //   }
  // };


  // const drawLine = () => {
  //   if (map && pickup && dropoff) {
  //     // Add a marker for Pickup Location
  //     addPickupMarker(pickup.coordinates, "Pickup Location");

  //     // Add a marker for Destination
  //     addDestinationMarker(dropoff.coordinates, "Destination");

  //     // Create a line between pickup and destination
  //     const newLine = {
  //       type: 'Feature',
  //       geometry: {
  //         type: 'LineString',
  //         coordinates: [pickup.coordinates, dropoff.coordinates],
  //       },
  //     };

  //     const sourceId = 'line-source';

  //     // Check if the source already exists, remove it if it does
  //     if (map.getSource(sourceId)) {
  //       map.removeSource(sourceId);
  //       map.removeLayer('line-layer');
  //     }

  //     // Add the line to the map
  //     map.addSource(sourceId, {
  //       type: 'geojson',
  //       data: newLine,
  //     });

  //     map.addLayer({
  //       id: 'line-layer',
  //       type: 'line',
  //       source: sourceId,
  //       layout: {
  //         'line-join': 'round',
  //         'line-cap': 'round',
  //       },
  //       paint: {
  //         'line-color': 'red',
  //         'line-width': 2,
  //       },
  //     });

  //     // Fit the map to the new line
  //     map.fitBounds([pickup.coordinates, dropoff.coordinates], { padding: 50 });

  //     setLine(newLine);
  //   }
  // };

  // Helper function to calculate zoom level based on bounds
  const getZoomLevel = (bounds, map) => {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;

    const ne = map.project(bounds.getNorthEast());
    const sw = map.project(bounds.getSouthWest());

    const dx = ne.x - sw.x;
    const dy = ne.y - sw.y;

    for (let zoom = ZOOM_MAX; zoom >= 0; --zoom) {
      if (dx <= WORLD_DIM.width && dy <= WORLD_DIM.height) {
        return zoom;
      }
      dx /= 2;
      dy /= 2;
    }

    return 0;
  };



  // Example function to add a line to the map using GeoJSON source and layer
  const addLineToMap = (coordinates) => {
    map.addSource('line-source', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      },
    });

    map.addLayer({
      id: 'line-layer',
      type: 'line',
      source: 'line-source',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': 'red',
        'line-width': 2,
      },
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Reverse geocode to get coordinates for departure and destination
      const pickupCoordinates = await reverseGeocodeCoordinates(pickup.locationName);
      const dropoffCoordinates = await reverseGeocodeCoordinates(dropoff.locationName);


      const response = await fetch('/api/apiProposeDrive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departure: pickup.locationName,
          destination: dropoff.locationName,
          date: rideDetails.date,
          time: rideDetails.time,
          seatsAvailable: rideDetails.seatsAvailable,
          userId: userId,
          departureLatitude: pickupCoordinates.latitude,
          departureLongitude: pickupCoordinates.longitude,
          destinationLatitude: dropoffCoordinates.latitude,
          destinationLongitude: dropoffCoordinates.longitude,
        }),
      });

      if (response.ok) {
        console.log('Drive proposed successfully');
        // Show a notification before redirecting
        toast.success('Drive proposed successfully', {
          position: 'top-center',
          duration: 3000,
        });
        // Redirect or perform any other actions after successful ride creation
        router.push('/'); // Redirect to the home page
      } else {
        console.error('Failed to create ride');
      }
    } catch (error) {
      console.error('Error during ride creation:', error);
    }
  };

  // Function to get coordinates from location name using reverse geocoding
  const reverseGeocodeCoordinates = async (locationName) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${accessToken}`
      );
      const data = await response.json();
      const coordinates = data.features[0]?.geometry?.coordinates || [0, 0];
      return { latitude: coordinates[1], longitude: coordinates[0] };
    } catch (error) {
      console.error("Error fetching reverse geocoding coordinates:", error);
      return { latitude: 0, longitude: 0 }; // Return default coordinates on error
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    setRideDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;

    setRideDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleTimeChange = (e) => {
    const { name, value } = e.target;

    setRideDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  useEffect(() => {
    setupMap();
  }, []); // Run this effect once after the initial render

  return (
    <Wrapper>


      <ButtonContainer>
        <Link href="/" passHref>
          <BackButton>
            <BsArrowLeft size={30} />
          </BackButton>
        </Link>
      </ButtonContainer>

      <SecondWrapper>
        <ContentContainer>
          <FormContainer>
            <h1 className="text-4xl mb-8 text-center font-serif text-blue-990">Proposer un trajet</h1>
            <form
              onSubmit={handleSubmit}
              className="border-2 border-blue-500 rounded-xl px-8 pt-6 pb-8 mb-4"
            >
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="departure">
                  Pickup Location:
                  <input
                    type="text"
                    name="departure"
                    value={pickup.locationName}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destination">
                  Destination:
                  <input
                    type="text"
                    name="destination"
                    value={dropoff.locationName}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                  Date:
                  <input
                    type="date"
                    name="date"
                    value={rideDetails.date}
                    onChange={handleDateChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </label>
                {dateError && (
                  <p className="text-red-500 text-s text-center">{dateError}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
                  Time:
                  <input
                    type="time"
                    name="time"
                    value={rideDetails.time}
                    onChange={handleTimeChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="seatsAvailable">
                  Seats Available:
                  <input
                    type="number"
                    name="seatsAvailable"
                    value={rideDetails.seatsAvailable}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </label>
                {seatError && (
                  <p className="text-red-500 text-s text-center">{seatError}</p>
                )}
              </div>
              <div className='mt-10 text-center'>
                <button
                  disabled={dateError || seatError}
                  type="submit"
                  className="left-1/2 bg-blue-500 hover:bg-blue-700
                 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Proposer le trajet
                </button>
              </div>
            </form>
          </FormContainer>
        </ContentContainer>

        <MapContainer id="map" />

      </SecondWrapper>


    </Wrapper>
  );
}
const Wrapper = tw.div`
  pt-1 bg-gray-200 h-screen 
`;

const SecondWrapper = tw.div`
  flex h-screen mt-2
`;

const ButtonContainer = tw.div`
  bg-white p-2 h-12
`;

const BackButton = tw.button``;

const MapContainer = tw.div`
  flex-1 w-full rounded-xl
`;

const ContentContainer = tw.div`
   flex flex-row mr-2 h-full
`;

const FormContainer = tw.div`
   max-w-2xl mb-1 p-8 bg-white shadow-2xl rounded-xl
`;



export default ProposeDrive;
