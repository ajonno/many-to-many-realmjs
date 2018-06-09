var Realm = require("realm");

const realm_server = "iostestapp.us1.cloud.realm.io";
const username = "test-user";
const password = "password";

var NOTIFIER_PATH = '^/([^/]+)/private$';

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

			// EXAMPLE 2 *** get all golfers that belong to club "Yarrabend Golf Club"******
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

         //
         //
         console.log("\n\nOBSERVER EXAMPLES\n")
         //
         //

			// EXAMPLE 5 *** all golfers in club = Yarrabend Golf Club ******
			// Observe Collection Notifications
			golfersInClub.addListener((golfers, changes) => {

				// Update UI in response to inserted objects
				changes.insertions.forEach((index) => {
					let insertedGolfer = golfers[index];
					console.log("added golfer to Yarrabend:", insertedGolfer)
				});

				// Update UI in response to modified objects
				changes.modifications.forEach((index) => {
					let modifiedGolfer = golfers[index];
					console.log("modified golfer in Yarrabend:", modifiedGolfer)
				});

				// Update UI in response to deleted objects
				changes.deletions.forEach((index) => {
					// Deleted objects cannot be accessed directly
					// Support for accessing deleted objects coming soon...
				});

			});

			console.log(`\n`);
			// ***************************************************************************








		});
	}
);

