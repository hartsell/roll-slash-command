var http = require('http');
var https = require('https');
var qs = require('querystring');

const PORT=process.env.PORT || 5000;

function handleRoll(post, request, response) {

	var my_token = process.env.SLASH_COMMAND_TOKEN;

	// dump the post to log
	console.log('RECEIVED SLASH COMMAND', JSON.stringify(post));

	if (post.token !== my_token) {
		response.writeHead(400);
		response.end('token mismatch');
		return;
	}

	var num_dice = 1;
	var num_sides = 6;
	var max_num_dice = 100;
	var max_num_sides = 100;

	var roll_options;

	if (post.text) {
		roll_options = post.text.split(' ');
		if (roll_options.length > 0) {
			// clean up, convert to numbers
			roll_options = roll_options.map(function (opt) {
				return parseInt(opt, 10);
			});
			// override default number of dice
			if (roll_options[0] > 0) {
				num_dice = roll_options[0];
				if (num_dice > max_num_dice) {
					num_dice = max_num_dice;
				}
			}
			// override default sides per die
			if (roll_options[1] > 0) {
				num_sides = roll_options[1];
				if (num_sides > max_num_sides) {
					num_sides = max_num_sides;
				}
			}
		}
	}

	var min = 1;
	var max = num_sides;

	var die_rolls = [];

	for (var i = 0; i < num_dice; i++) {
		die_rolls.push(Math.floor(Math.random() * (max - min + 1)) + min);
	}

	var total = die_rolls.reduce(function (a, b) {
		return a + b;
	});

	var post_text;

	// From slackbot, say "you". Anywhere else, do an @mention.
	var who_string = post.channel_id === 'D04EGV62L' ? 'You' : '@' + post.user_name;

	if (num_dice === 1) {
		post_text = who_string + ' rolled a ' + num_sides + '-sided die and got a *' + total + '*.';
	} else {
		post_text = who_string + ' rolled ' + num_dice + ' ' + num_sides + '-sided dice and got '+ die_rolls.join(' + ') + ' = *' + total + '*.';
	}

	if (num_dice >= 3 && num_sides >= 6 && (total === num_dice || total === num_dice * num_sides)) {
		post_text += ' What luck!';
	}

	var post_channel = post.channel_id;

	console.log('POST TEXT', post_text);
	console.log('POST CHANNEL', post_channel);

	var post_data = qs.stringify({
		payload: JSON.stringify({
			text: post_text,
			channel: post_channel
		})
	});

	var post_options = {
		hostname: process.env.INCOMING_WEBHOOK_HOSTNAME,
		path: process.env.INCOMING_WEBHOOK_PATH,
		port: '443',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': post_data.length
		}
	};

	var post_req = https.request(post_options, function(res) {
		console.log('POST STATUS: ' + res.statusCode);
		console.log('POST HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
	});

	post_req.on('error', function(e) {
		console.log('POST ERROR: ' + e.message);
	});

	// post the data
	post_req.write(post_data);
	post_req.end();

	// close the slash command connection
	response.writeHead(200);
	// add response text if you want slackbot to say something.
	response.end();

}

function handleRequest(request, response){

	if (request.method == 'POST') {
		var body = '';
		request.on('data', function (data) {
			body += data;

			// Too much POST data, kill the connection!
			if (body.length > 1e6)
				request.connection.destroy();
		});
		request.on('end', function () {
			var post = qs.parse(body);

			
			handleRoll(post, request, response);


		});
	} else {
		response.end();
	}
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
	console.log("Server listening on: http://localhost:%s", PORT);
});
