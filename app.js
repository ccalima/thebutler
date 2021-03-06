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
						message.author.send("Here are the questions you are expected to answer. Please answer them thoroughly and to the best of your knowledge, as this is Enrage's first impression of you. \nOnce you have completed all the questions, **please copy/paste the questions and answers into the created text channel named after you in the Enrage Discord.**");
						message.author.send("You must complete this process within 24 hours. Failure to do so will result in the immediate rejection of your application. \nAlso note that your application will be scrutinized by both the officers and the members.");
						message.author.send("With that, here are the questions: \n1). What is your character's name? \n2). What made you choose Enrage? What are your expectations of us?");
						if (message.content === '-Raider') {
							message.author.send("3). What class(es) do you raid on? \n4). Please link your Lodestone with your Achievements set to be viewed publically. \n5). Please link your fflogs. \n6). Do you have any goals as a raider? If so, describe what you hope to accomplish.");
						}
						if (message.content === '-Crafter') {
							message.author.send("3). Please link your Lodestone. \n4). Please link your gear/stats for your gatherer/crafter. \n5). List all mastery/folklore books you have obtained.");
						}
						if (message.content === '-Social') {
							message.author.send("3). Name the Enrage Raider who referred you to this free company. One is required.");
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
    if (message.channel.name === 'crafts') {
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

	// lol
	// if (message.content.toLowerCase() === '-requesterp') {
	// 	requested = true;
	// 	message.channel.send("Here are the list of cat sluts at your disposal: ");
	// 	message.channel.send("Rai Nagisei: 1 gil");
	// 	message.channel.send("Please indicate which cat slut you would like services from by typing -(name). No space in-between.");
	// }
	// if (message.content.toLowerCase() === '-rainagisei' && requested) {
	// 	requested = false;
	// 	message.channel.send("Very well. Please send a DM to her at your earliest convenience.");
	// }
});

client.login(bot_token.bot_token);