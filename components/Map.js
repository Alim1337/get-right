import { useEffect } from "react"
import tw from "tailwind-styled-components"
import mapboxgl from "!mapbox-gl"
export const accessToken =
    "pk.eyJ1IjoidGhlYXNzZXQiLCJhIjoiY2tyb3V1ZTZmMWpsMDJubDdha2lsbXYxeSJ9.A_zwqkPVPGP75uNMSHlzNQ"

mapboxgl.accessToken = accessToken

const Map = ({ pickupCoords, dropoffCoords }) => {
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v11",
            center: [44, 36.2],
            zoom: 12,
        })

        if (pickupCoords && dropoffCoords) {
            addToMap(map, pickupCoords)
            addToMap(map, dropoffCoords)

            map.fitBounds([pickupCoords, dropoffCoords], {
                padding: 50,
            })
        }
    }, [pickupCoords, dropoffCoords])

    const addToMap = (map, latLon) =>
        new mapboxgl.Marker().setLngLat(latLon).addTo(map)

    return <Wrapper id='map'></Wrapper>
}

const Wrapper = tw.div`
    flex-1 h-1/2
`

export default Map
