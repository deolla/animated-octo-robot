import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
const app = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;
const apiLocationKey = process.env.apikey;
const apiWeatherKey = process.env.apikey1;

app.get('/api/hello', async (req, res) => {
  const clientName = req.query.visitor_name;
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(req.header)
  console.log(clientIp);

  try {
    // Get location data based on client's IP address
    const locationResponse = await axios.get(`https://ipinfo.io/${clientIp}?token=${apiLocationKey}`)
    .then(response => {
      console.log(response.data.city);
      return response.data.city;
    })  
      .catch(error => {
        console.error('Error fetching location data:', error.message);
        throw new Error('Location data not available');
      });

    const weatherResponse = await axios.get(`http://api.weatherstack.com/current?access_key=${apiWeatherKey}&query=${locationResponse}`)
      .then(response => {
        console.log(response.data.current.temperature);
        return response.data.current.temperature;
      })
      .catch(error => {
        console.error('Error fetching weather data:', error.message);
        throw new Error('Weather data not available');
      });

    let temperature = weatherResponse;

    res.json({
      client_ip: clientIp,
      location: locationResponse,
      greetings: `Hello, ${clientName}! It's ${parseInt(temperature)} degrees Celcius in ${locationResponse}.`,
    });

  } catch (err) {
    console.error('Error fetching data:', err.message);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
