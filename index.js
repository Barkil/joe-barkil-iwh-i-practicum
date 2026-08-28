const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.ACCESS_TOKEN;

const CUSTOM_OBJECT_TYPE = '2-68314061';
const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
};

// ROUTE 1 - Homepage: fetch custom object data and pass it to the front-end.

app.get('/', async (req, res) => {
    const url = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE}?properties=name,genre,streaming_service`;
    try {
        const resp = await axios.get(url, { headers });
        const data = resp.data.results;
        res.render('homepage', { title: 'Tv Shows Homepage | Integrating With HubSpot I Practicum', data });
    } catch (error) {
        console.error(error);
    }
});

// ROUTE 2 - Form to create or update custom object data.

app.get('/update-cobj', (req, res) => {
    res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});

// ROUTE 3 - Create the custom object record, or update it if a record with the same name already exists.

app.post('/update', async (req, res) => {
    const { name, genre, streaming_service } = req.body;
    const properties = { name, genre, streaming_service };

    try {
        const searchUrl = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE}/search`;
        const searchBody = {
            filterGroups: [{
                filters: [{ propertyName: 'name', operator: 'EQ', value: name }]
            }]
        };
        const searchResp = await axios.post(searchUrl, searchBody, { headers });
        const existing = searchResp.data.results[0];

        if (existing) {
            const updateUrl = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE}/${existing.id}`;
            await axios.patch(updateUrl, { properties }, { headers });
        } else {
            const createUrl = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`;
            await axios.post(createUrl, { properties }, { headers });
        }
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/update-cobj');
    }
});

// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));