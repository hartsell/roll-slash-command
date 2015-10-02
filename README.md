# roll-slash-command
A Slack slash command and incoming webhook combo to roll some dice.

# Setup

## Install this node app

It's fairly easy to set up a Heroku account and clone this repo. A walkthrough for how that works is here: https://devcenter.heroku.com/articles/getting-started-with-nodejs

## Configure the Slash Command

After signing into your Slack team, go to https://slack.com/services and click the button to add a new Slash Command.

Command name: `/roll`

URL: `<your node server's web address>`

Method: `POST`

Token: `Your slash command token`

Autocomplete help text description: `Roll the dice!`

Autocomplete help text hint: `[number of dice] [sides per die]`

## Configure the Incoming Webhook

Go to https://slack.com/services and click the button to add a new Incoming Webhook.

Post to Channel: `<doesn't matter>`

Customize Name: `Rollbot`

Customize Icon: Choose the :game_die: emoji

# Bring your Slack config back into your Node app

After configuring your Slash Command and Incoming Webhook, you'll need to set the following environment variables on your Heroku server:

`heroku config:set SLASH_COMMAND_TOKEN=<YOUR_SLASH_COMMAND_TOKEN>`

`heroku config:set INCOMING_WEBHOOK_HOSTNAME=hooks.slack.com`

`heroku config:set INCOMING_WEBHOOK_PATH=/services/<YOUR_INCOMING_WEBHOOK_PATH>`

## Try it out

Go to any channel or DM and type `/roll`