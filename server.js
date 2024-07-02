import express from 'express';
import requestIp from 'request-ip';
import axios from 'axios';
// import geoip from 'geoip-lite';
import dotenv from 'dotenv';

dotenv.config()

const app = express();
const PORT = 3000;

const apiWeatherKey = process.env.apikey1;


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
  const client_ip = cleanIPv6(req.headers['x-forwarded-for'] || req.clientIp || '127.0.0.1' || req.connection.remoteAddress);
  const ip = cleanIPv4(req.clientIp || '127.0.0.1');

  console.log(client_ip);
  console.log(ip);

  try {
    const weatherResponse = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
      params: {
        key: apiWeatherKey,
        q: client_ip,
      },
    });
    
    const ipLocation = weatherResponse.data.location.name;
    const temperature = weatherResponse.data.current.temp_c;
    
    const response = {
      client_ip: ip,
      location: ipLocation,
      greeting: `Hello, ${visitor_name}!, the temeperature is ${parseInt(temperature)} degrees Celcius in ${ipLocation}`,
    };
    res.json(response);
  } catch (error) {
    console.error(`Error processing request: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
