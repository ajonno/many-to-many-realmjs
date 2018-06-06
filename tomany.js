var Realm = require('realm');

const realm_server = 'iostestapp.us1.cloud.realm.io';
const username = 'test-user';
const password = 'password';

const golferSchema = {
    name: 'Golfer',
    properties: {
        name: 'string',
        clubs: { type: 'list', objectType: 'Club' }
        // clubs: { type: 'linkingObjects', objectType: 'Club', property: 'golfers' }
    }
}

const clubSchema = {
    name: 'Club',
    properties: {
        name: 'string',
        golfers: { type: 'linkingObjects', objectType: 'Golfer', property: 'clubs' }
    }
}

Realm.Sync.User.login(`https://${realm_server}`, username, password)
    .then((user) => {
        Realm.open({
            schema: [golferSchema, clubSchema],
            sync: {
                user: user,
                url: `realms://${realm_server}/golf`,
            }
        })
        .then((realm) => {
            const golferFilter = 'Gus';
            const clubFilter = '5 iron'
            const golfer = realm.objects('Golfer').filtered(`name = '${golferFilter}'`);
            const club = realm.objects('Club').filtered(`name = '${clubFilter}'`)

            console.log(golfer[0].name);
            console.log(golfer[0].clubs)
            console.log(golfer[0].clubs[2].golfers);

            console.log(club[0].name);
            console.log(club[0].golfers);
            console.log(club[0].golfers[2].clubs)
        })
    })