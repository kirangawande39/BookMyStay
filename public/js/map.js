 // TO MAKE THE MAP APPEAR YOU MUST
    // ADD YOUR ACCESS TOKEN FROM
    // https://account.mapbox.com
    // let mapToken="<%= process.env.MAP_TOKEN%>"
    
    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: 'map', // Container ID where the map will render
        
        center: coordinates, // Starting position [lng, lat]
        zoom: 10 // Initial zoom level
    });
    
    // Create a default Marker and add it to the map
    const marker1 = new mapboxgl.Marker({ color: "black" })
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // Popup with an offset
           
            .setHTML(`
                <div style="text-align: left; font-family: Arial, sans-serif; max-width: 200px; ">
                    <h3 style="margin: 0; color: #2980b9;font-size:1rem;" >${singleData.title}</h3>
                    <img src='${singleData.image.url}' alt="Location" style="width: 100%; border-radius: 10px; margin: 5px 0;">
                    <a href="https://example.com" target="_blank" style="display: inline-block; margin-top: 10px; color: white; background: #e74c3c; padding: 5px 10px; text-decoration: none; border-radius: 5px;">Explore Now</a>
                    </div>
                    `)
                    
                )
                .addTo(map);
                
                // <p style="margin: 0; font-size: 14px; color: #7f8c8d;">${singleData.description}</p>
 
    // satellite
    // mapboxgl.accessToken = mapToken;

    // const map = new mapboxgl.Map({
    //     container: 'map', // Container ID where the map will render
    //     style: 'mapbox://styles/mapbox/satellite-v9', // Satellite view style
    //     center: coordinates, // Starting position [lng, lat]
    //     zoom: 10 // Initial zoom level
    // });
    
    // // Create a default Marker and add it to the map
    // const marker1 = new mapboxgl.Marker({ color: "black" })
    //     .setLngLat(coordinates)
    //     .addTo(map);
    
 



    