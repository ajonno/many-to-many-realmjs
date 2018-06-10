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
		},
		courses: {
			type: "list",
			objectType: "Course"
		},

	}
};

const courseSchema = {
	name: "Course",
	properties: {
		courseName: "string",
		club: {
			type: "linkingObjects",
			objectType: "Club",
			property: "courses"
		},
		courseHoles: {
			type: "list",
			objectType: "CourseHole"
		}
	}
};

const courseHolesSchema = {
	name: "CourseHole",
	properties: {
		courseHoleName: "string",
		course: {
			type: "linkingObjects",
			objectType: "Course",
			property: "courseHoles"
		}
	}
};

//******* TEST ONE TO MANY (no links) ******

//notes:
//1. i could not add a Person without also adding a Pet (required). "null" is NOT ok for a Pet. Need at least one.
const personSchema = {
	name: "Person",
	properties: {
		name: "string",
		pets: {
			type: "list",
			objectType: "Pet"
		}
	}
};
const petSchema = {
	name: "Pet",
	properties: {
		petName: "string"
	}
};

const personWithLinkSchema = {
	name: "PersonWithLink",
	properties: {
		name: "string",
		pets: {
			type: "list",
			objectType: "PetWithLink"
		}
	}
};const petWithLinkSchema = {
	name: "PetWithLink",
	properties: {
		petName: "string",
		personWithLink: {
			type: "linkingObjects",
			objectType: "PersonWithLink",
			property: "pets"
		}

	}
};

//******* END -- TEST ONE TO MANY (no links) ******



Realm.Sync.User.login(`https://${realm_server}`, username, password).then(
	user => {
		Realm.open({
			schema: [golferSchema, clubSchema, courseSchema, courseHolesSchema, petSchema, personSchema, petWithLinkSchema, personWithLinkSchema],
			sync: {
				user: user,
				url: `realms://${realm_server}/golf`
			}
		}).then(realm => {

			console.log("\n\nQUERY EXAMPLES (using linkingObjects)")
			console.log("-------------------------------------")


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
			// ***************************************************************************

			// PET TESTING ***************************************************************************

			console.log("\n*************************************************************************************************")

			console.log("\nLINKINGOBJECT EXAMPLES")
			console.log("----------------------")

			// EXAMPLE 1 -> query a single pet (Fido) and see if it ALSO returns the Person(s) that have Fido
			const fidoOwners = realm.objects("Pet").filtered(`petName = "Fido"`);
			console.log(`\n1. Who owns Fido ?`);
			for (let p of fidoOwners) {
				console.log(`pet: ${p.petName}`);
			}
			console.log(`THIS DOES NOT/CAN NOT RETURN WHO (Person) OWNS FIDO, BECAUSE THE petSchema DOES NOT HAVE A linkingObjects PROPERTY\n`);


			// EXAMPLE 2 -> same as EXAMPLE 1 a single pet (Grover) and see if it ALSO returns the Person(s) that have Grover
			const grover = realm.objects("PetWithLink").filtered(`petName = "Grover"`);
			console.log(`2. Who owns Grover ?`);

			var personThatOwnsGrover = grover[0].personWithLink

			console.log(`personThatOwnsGrover. ${personThatOwnsGrover[0].name}\n\n`);

				//note: you only need to loop through personThatOwnsGrover if there is more than one

			// ***************************************************************************************

			//
			//
			console.log("*************************************************************************************************\n")
			console.log("OBSERVER EXAMPLE")
			//
			//

			// EXAMPLE 5 *** all golfers in club = Yarrabend Golf Club ******
			// Observe Collection Notifications
			console.log("NB: ==> now listening for changes re: all golfers in Yarrabend Golf Club")
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

			console.log("\n\n\n")
			// ***************************************************************************




		});
	}
);

