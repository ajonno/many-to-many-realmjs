var Realm = require("realm");

const realm_server = "iostestapp.us1.cloud.realm.io";
const username = "test-user";
const password = "password";

const golferSchema = {
	name: "Golfer",
	properties: {
		name: "string",
		clubs: {
			type: "list",
			objectType: "Club"
		}
		// clubs: { type: 'linkingObjects', objectType: 'Club', property: 'golfers' }
	}
};

const clubSchema = {
	name: "Club",
	properties: {
		name: "string",
		golfers: {
			type: "linkingObjects",
			objectType: "Golfer",
			property: "clubs"
		}
	}
};

Realm.Sync.User.login(`https://${realm_server}`, username, password).then(
	user => {
		Realm.open({
			schema: [golferSchema, clubSchema],
			sync: {
				user: user,
				url: `realms://${realm_server}/golf`
			}
		}).then(realm => {
			//
			// EXAMPLE 1 *** get all Clubs for Golfer "Gus" ******************************
			const golfer = realm.objects("Golfer").filtered(`name = 'Gus'`);

			var clubsForGolfer = golfer[0].clubs;

			console.log(`\n1. clubsForGolfer: Gus`);
			for (let p of clubsForGolfer) {
				console.log(`club: ${p.name}`);
			}
			// ***************************************************************************

			// EXAMPLE 2 *** get all golfers that belong to club "Bayview Golf Club"******
			const club = realm
				.objects("Club")
				.filtered(`name = 'Yarrabend Golf Club'`);

			var golfersInClub = club[0].golfers;

			console.log(`\n2. golfersInClub: Yarrabend Golf Club`);
			for (let p of golfersInClub) {
				console.log(`golfer: ${p.name}`);
			}
			// ***************************************************************************

			// EXAMPLE 3 *** get all golfers with NO club ******
			const golfers = realm.objects("Golfer").filtered(`clubs.@count = 0`);

			//var golfersWithNoClub = golfers[0].clubs;

			console.log(`\n3. golfersWithNoClub`);
			for (let p of golfers) {
				console.log(`golfer: ${p.name}`);
			}
			// ***************************************************************************

			// EXAMPLE 4 *** get all clubs with NO golfer ******
			const clubs = realm.objects("Club").filtered(`golfers.@count = 0`);

			console.log(`\n4. clubsWithNoGolfer`);
			for (let p of clubs) {
				console.log(`golfer: ${p.name}`);
			}
			console.log(`\n`);
			// ***************************************************************************
		});
	}
);
