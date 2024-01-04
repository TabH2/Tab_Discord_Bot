# Tab's Scripts
This is a simple discord bot using Node.JS and Discord.JS. It's a very simple bot with two commands, a mute command and a .mn command. The .mn command is a command which will change your nickname in all discord servers the bot is in. If you have the manage_nickname permission the bot will then allow you to change other users nickname's using the .mn @user command and that will change that user's nickname to a specified nickname to all servers that the bot is currently in. It has a mute command as well, what it does is you need to input the cateogry ID into the index.js and when you run the .mute command, it will create a new channel in the category called muted-(username of person muted) and will also remove all the user's current roles and give them the "Muted" role.

# Features
- Mute Command
- Nickname Command

# Installation
- Install Node.JS (https://nodejs.org/en/download)
- Open visual studio code or any code editor with terminal with a folder and name it anything (Discord-Bot) etc.
- Open the terminal
- Type 'npm init -y' and press enter
- A package.json file will be created, change "main": to "main": "index.js",
- Go back into terminal and run the command 'npm install discord.js@13'
- Drag the index.js file into your folder and scroll all the way down and replace "BOT_TOKEN" with your Discord Bot Token (https://discord.com/developers/applications)
- Go in the terminal and type node index.js and your bot should be functioning!

# Contributors
- Tab
