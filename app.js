// client information
const Discord = require('discord.js');
const client = new Discord.Client();

// google doc information
var GoogleSpreadsheet = require('google-spreadsheet');
var creds = require('./client_secret.json');
var bot_token = require('./bot_secret.json');
var doc = new GoogleSpreadsheet('1E1o3uWXYlDfo79pHzHkFHqGGPZjZikfCw53ITLHnNTs');

// enrage server information
var guild, roles, channels, members,
	officer, staticleader, raider, crafter, social, guest,
	entrancehall,
	applicants = {},
	messagesToDelete,
	requested;

client.on('ready', () => {
	console.log('I am ready!');

	// authenticate with the Google Spreadsheets API
	doc.useServiceAccountAuth(creds, function () {
		doc.setAuthToken('1E1o3uWXYlDfo79pHzHkFHqGGPZjZikfCw53ITLHnNTs');
		console.log('Google auth set');
	});

	// guild
	guild = client.guilds.find('id', '219333703833223171');

	// roles
	roles = guild.roles;
	officer = roles.find('name', 'Officer');
	staticleader = roles.find('name', 'Static Leader');
	raider = roles.find('name', 'Raider');
	crafter = roles.find('name', 'FC Crafter');
	social = roles.find('name', 'Social');
	enragemember = roles.find('name', 'FC Member');
	guest = roles.find('name', 'Guest');
	everyone = roles.find('name', '@everyone');

	// channels
	channels = guild.channels;
	entrancehall = channels.find('name', 'entrance-hall');

	// members
	members = guild.members;
});

client.on('guildMemberAdd', member => {
	entrancehall.send('Good day, ' + member.user.username + '. How may I help you?\n' +
		'Enter "-Raider" if you wish to apply for the rank of our raiders.\n' +
		'Enter "-Crafter" if you wish to apply for the rank of our crafters and gatherers.\n' +
		'Enter "-Social" if you wish to apply for the rank of our social members.\n' +
		'Otherwise, enter "-Guest" if you wish to simply visit our server.');
});

client.on('message', message => {
	if (message.author.bot) {
		return;
	}
	if (message.channel.name === 'entrance-hall') {
		if (['-raider', '-crafter', '-social'].indexOf(message.content.toLowerCase()) > -1) {
			if (typeof applicants[message.author.username] !== 'string') {
				applicants[message.author.username] = 'false';
				message.guild.createChannel(message.author.username.replace(/\s+/g, '-').replace(/[^\x00-\x7F]/g, '').replace(/\W/g, '').toLowerCase().toLowerCase(), 'text')
					.then(function (channel) {
						channel.overwritePermissions(message.author, {
							READ_MESSAGES: true,
							SEND_MESSAGES: true
						});
						channel.overwritePermissions(everyone, {
							READ_MESSAGES: false,
							SEND_MESSAGES: false
						});
						channel.overwritePermissions(officer, {
							READ_MESSAGES: true,
							SEND_MESSAGES: true
						});
						message.author.send("Here are the questions you are expected to answer. Please answer them thoroughly and to the best of your knowledge, as this is Enrage's first impression of you. \nOnce you have completed all the questions, **please copy/paste the questions and answers into the created text channel named after you in the Enrage Discord.**");
						message.author.send("You must complete this process within 24 hours. Failure to do so will result in the immediate rejection of your application. \nAlso note that your application will be scrutinized by both the officers and the members.");
						message.author.send("With that, here are the questions: \n1). What is your character's name? \n2). What made you choose Enrage? What are your expectations of us?");
						if (message.content === '-Raider') {
							message.author.send("3). What class(es) do you raid on? \n4). Please link your Lodestone with your Achievements set to be viewed publically. \n5). Please link your fflogs. \n6). Do you have any goals as a raider? If so, describe what you hope to accomplish. \n**Please copy/paste the questions and answers into the created text channel named after you in the Enrage Discord.**");
						}
						if (message.content === '-Crafter') {
							message.author.send("3). Please link your Lodestone. \n4). Please link your gear/stats for your gatherer/crafter. \n5). List all mastery/folklore books you have obtained. \n**Please copy/paste the questions and answers into the created text channel named after you in the Enrage Discord.**");
						}
						if (message.content === '-Social') {
							message.author.send("3). Name the Enrage Raider who referred you to this free company. One is required. \n**Please copy/paste the questions and answers into the created text channel named after you in the Enrage Discord.** ");
						}
						message.channel.send("Very good. I have sent the application instructions directly to you. Please check your DMs.");
					});
				message.guild.createChannel(message.author.username.replace(/\s+/g, '-').replace(/[^\x00-\x7F]/g, '').replace(/\W/g, '').toLowerCase() + '-discussion', 'text')
					.then(function (channel) {
						channel.overwritePermissions(message.author, {
							READ_MESSAGES: false,
							SEND_MESSAGES: false
						});
						channel.overwritePermissions(everyone, {
							READ_MESSAGES: false,
							SEND_MESSAGES: false
						});
						channel.overwritePermissions(enragemember, {
							READ_MESSAGES: false,
							SEND_MESSAGES: false
						});
						channel.overwritePermissions(officer, {
							READ_MESSAGES: true,
							SEND_MESSAGES: true
						});
					});
			} else {
				message.channel.send("It seems like you already have an application in place. Please wait for your current application to finish before applying for another role.");
			}
		}
		if (message.content.toLowerCase() === '-guest') {
			message.member.addRole(guest);
			message.channel.send('Very good. We hope your stay is most comfortable.');
		}
	}
	if (message.channel.name === message.author.username.replace(/\s+/g, '-').replace(/[^\x00-\x7F]/g, '').replace(/\W/g, '').toLowerCase()) {
		if (message.content.toLowerCase() === 'yes') {
			applicants[message.author.username] = 'true';
			message.channel.overwritePermissions(enragemember, {
				READ_MESSAGES: true,
				SEND_MESSAGES: false
			}).then(function () {
				message.channel.send(enragemember.toString() + "(s), " + message.author.username + " has submitted an application for your discretion. Please review his answers and credentials.");
			});
		} else {
			if (applicants[message.author.username] === 'false') {
				message.channel.send('Have you finished your application? If so, enter "Yes" and the members will review your application. Otherwise, edit your response as necessary before submitting.');
			}
		}
	}
	if (message.channel.name === 'recruitment') {
		if (message.content.toLowerCase() === '-clear') {
      		if (!message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
        		message.channel.send("Apologies, you do not have the permission to execute the command \""+message.content+"\"");
        		return;
      		}
      		if (message.channel.type === 'text') {
        		message.channel.fetchMessages()
          			.then(messages => {
          				messagesToDelete = messages.filter(function (message) {
          					if (!message.pinned) {
          						return true;
          					}
          					return false;
          				});
            			message.channel.bulkDelete(messagesToDelete);
            			message.channel.send("Messages for #recruitment have been cleared for the week.");
          			}).catch(err => {
            			console.log(err);
          			});
      		}
    	}
    	if (message.content.toLowerCase().indexOf('-alliance') > -1) {
    		if (message.content.toLowerCase().indexOf('clear') > -1) {
    			if (!message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
        			message.channel.send("Apologies, you do not have the permission to execute the command \""+message.content+"\"");
      			} else {
    				doc.getRows(1, {offset: 1}, function (err, rows) {
    					rows.forEach(function (row) {
    						row.del(function () {});
    					});
    				});
    				message.channel.send("Roster for the alliance raid has been cleared for the week.");
    			}
    			return;
    		}
    		var parsedString = message.content.split(';');
    		if (!parsedString[1] || !parsedString[2]) {
    			message.channel.send("There was an error processing your request. The proper formatting is");
    			message.channel.send("```-alliance ; (name) ; (available jobs) ; (preferred jobs [optional])```");
    			return;
    		}
    		doc.addRow(1, {
				Name: parsedString[1].trim(),
				'Available Jobs': parsedString[2].trim(),
				'Preferred Job': parsedString[3] ? parsedString[3].trim() : 'No preference'
			}, function (err) {
  				if (err) {
    				console.log(err);
  				}
			});
			message.channel.send("You have been added to the alliance raid for the week.");
    	}
    }
    if (message.channel.name === 'crafts-and-supplies') {
    	if (message.content.toLowerCase() === '-clear') {
      		if (!message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
        		message.channel.send("Apologies, you do not have the permission to execute the command \""+message.content+"\"");
        		return;
      		}
      		if (message.channel.type === 'text') {
        		message.channel.fetchMessages()
          			.then(messages => {
          				messagesToDelete = messages.filter(function (message) {
          					if (!message.pinned) {
          						return true;
          					}
          					return false;
          				});
            			message.channel.bulkDelete(messagesToDelete);
            			message.channel.send("Messages for #crafts have been cleared for the week.");
          			}).catch(err => {
            			console.log(err);
          			});
      		}
    	}
    	if (message.content.toLowerCase().indexOf('-supplies') > -1) {
    		if (message.content.toLowerCase().indexOf('clear') > -1) {
    			if (!message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
        			message.channel.send("Apologies, you do not have the permission to execute the command \""+message.content+"\"");
      			} else {
    				doc.getRows(2, {offset: 1}, function (err, rows) {
    					rows.forEach(function (row) {
    						row.del(function () {});
    					});
    				});
    				message.channel.send("Requests for supplies have been cleared for the week.");
    			}
    			return;
    		}
    		var parsedString = message.content.split(';');
    		if (!parsedString[1] || !parsedString[2] || !parsedString[3]) {
    			message.channel.send("There was an error processing your request. The proper formatting is");
    			message.channel.send("```-supplies ; (name) ; (total number of raid hours for the week) ; (food) ; (type of potion [optional])```");
    			return;
    		}
    		doc.addRow(2, {
				Name: parsedString[1].trim(),
				'Raid Hours': parsedString[2].trim(),
				Food: parsedString[3].trim(),
				'Food Amount': 2 * parseInt(parsedString[2].trim()),
				Potion: parsedString[4] ? parsedString[4].trim() : 'None',
				'Potion Amount': parsedString[4] ? 5 * parseInt(parsedString[2].trim()) : 0
			}, function (err) {
  				if (err) {
    				console.log(err);
  				}
			});
			message.channel.send("Your request has been added for the week.");
    	}
	}
	if (message.channel.name === 'entrance-hall') {
		if (message.content.toLowerCase() === '-clear') {
					if (!message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
						message.channel.send("Apologies, you do not have the permission to execute the command \""+message.content+"\"");
						return;
					}
					if (message.channel.type === 'text') {
						message.channel.fetchMessages()
						 .then(messages => {
							 messagesToDelete = messages.filter(function (message) {
								if (!message.pinned) {
									return true;
									 }
								return false;
											});
										message.channel.bulkDelete(messagesToDelete);
										message.channel.send("Messages for #entrance-hall have been cleared.");
									}).catch(err => {
										console.log(err);
									});
					}
		}
}

    if (message.content.toLowerCase() === '-bacon') {
      requested = true;
      message.channel.send("Crispy bacon is the only right way.")
    }
	// lol
	  if (message.content.toLowerCase() === '-requesterp') {
  	 requested = true;
  	 message.channel.send("Here is the list of sluts at your disposal: ");
  	 message.channel.send("Rai Nagisei: 1 gil");
		 message.channel.send("Tiamata Pendragon (Little Tia): Free")
     message.channel.send("Please indicate which cat slut you would like services from by typing -(name). No space in-between.");
	 }
	 if (message.content.toLowerCase() === '-rainagisei' && requested) {
	 	requested = false;
	 	message.channel.send("Very well. Please send a DM to her at your earliest convenience.");
	 }
	 if (message.content.toLowerCase() === '-tiamatapendragon' && requested) {
		 requested = false;
		 message.channel.send("Very well. Please send a DM to <@107222810081894400> at your earliest convenience.");
	 }
	 if (message.content.indexOf('iwi') > -1) {
		 message.channel.send("uwu")
	 }
	 if (message.content.indexOf('IwI') > -1) {
		 message.channel.send("UwU")
	}
	if (message.content.indexOf('Iwi') > -1) {
		message.channel.send("Uwu")
	}
	if (message.content.indexOf('iwI') > -1) {
		message.channel.send("uwU")
	}
	if (message.content.indexOf('IWI') > -1) {
		message.channel.send("UWU")
	}
	if (message.content.indexOf('iWI') > -1) {
		message.channel.send("uWU")
	}
	if (message.content.indexOf('IWi') > -1) {
		message.channel.send("UWu")
	}
	if (message.content.indexOf('iWi') > -1) {
		message.channel.send("uWu")
	}
	if (message.content.toLowerCase() === 'owo') {
		message.channel.send("What's this?")
	}
// if (message.content.indexOf('futa') > -1) {
 // message.channel.send("To answer why it bother me so much, it's the mlp of fetishes. Like ponifying everything and anything every female character has to have a dick drawn on it because the people who like it can't fap otherwise or feel insecure, seeing another man on screen. A man with a vagina isn't as popular of a 'fetish' because it only amplifies their insecurities because it has masculine traits. It's not considered gay by the people who like it because they don't care for the dick as much as they care that it's just not a man in general but two women on screen.")
//  message.channel.send("The very fact this is enjoyed by mostly NEET dudes living at home with no job or girlfriend alone says plenty about how insecure one must be in order to enjoy this stuff. It's not traumatizing to see it, it's frustrating. No self respecting woman wants to see guys circlejerk about epic drawings of male genetalia on a female body. This and Loli are genuinely abrasive and in your face fetishes of the 4chan community when it should not be anything more than a private niche fetish. The whole argument that dickgirls don't fall into a /d/ channel because it's a niche fetish is entirely just thinly veiled friend politic.")
// message.channel.send("You don't want to upset what you think is a majority and I can get behind that. Don't tell me you believe these people completely justified in their actions if they threatened to leave unless you change things and constantly parade around like I'm the whiny one. The mindset people have that make them like this garbage is the very reason I think futa is the worst thing I've ever seen. The fact you tell me to ''deal with it'' is the most ironic part of this whole drama, given that you tried a democratic approach and the losing party, clearly the minority resorted to tantrums and threats towards you almost instantly.")
// message.channel.send("They couldn't deal with it. But I will. Hope that answers why Futa and people who like Futa belong in /d/ and don't get to post in /h/ in anywhere but here and why I think it's not even a fetish.")
// }

});

client.login(bot_token.bot_token);
