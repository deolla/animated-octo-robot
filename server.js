import express from 'express';
import requestIp from 'request-ip';
import axios from 'axios';
import geoip from 'geoip-lite';
import dotenv from 'dotenv';

dotenv.config()

const app = express();
const PORT = 3000;

const apiWeatherKey = process.env.apikey1 || '3fc121facde2e3444b75cfe8163afcc9';


app.use(requestIp.mw());

const cleanIPv6 = (ip) => {
  if (ip && ip.startsWith('::ffff:')) {
    return ip.slice(7);
  }
  return ip;
};


const cleanVisitorName = (name) => {
  return name.replace(/[\\/"]/g, '');
};


app.get('/api/hello', async (req, res) => {
  const visitor_name = cleanVisitorName(req.query.visitor_name || 'Guest');
  const client_ip = cleanIPv6(req.headers['x-forwarded-for'] || req.connection.remoteAddress);
  const geo = geoip.lookup(client_ip);
  
  const ipLocation = geo?.city;
  console.log(ipLocation);

  // let location = 'Location information not available';
  // if (geo && geo.city) {
  //   location = geo.city;
  // }

  const weatherResponse = await axios.get(`http://api.weatherstack.com/current?access_key=${apiWeatherKey}&query=${ipLocation}`)
      .then(response => {
        console.log(response.data);
        return response;
      })
      .catch(error => {
        console.error('Error fetching weather data:', error.message);
        throw new Error('Weather data not available');
      });

      //const temperature = weatherResponse.da;
      //console.log(temperature);

  const response = `{
    "client_ip": "${client_ip}",
    "location": "${ipLocation}",
    "greeting": "Hello, ${visitor_name}!"
  }`;

  res.type('json').send(response);
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
