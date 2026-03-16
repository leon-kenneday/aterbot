import mineflayer from "mineflayer";
// Fixed the import that caused the SyntaxError
import * as pathfinder from "mineflayer-pathfinder";
import CONFIG from "../config.json" with { type: "json" }; 

const pvp = require('mineflayer-pvp').plugin;
const armorManager = require('mineflayer-armor-manager');

const bot = mineflayer.createBot({
    host: CONFIG.client.host,
    port: CONFIG.client.port,
    username: CONFIG.client.username,
    version: CONFIG.client.version || false,
    auth: "offline"
});

// Load Plugins
bot.loadPlugin(pathfinder.pathfinder);
bot.loadPlugin(pvp);
bot.loadPlugin(armorManager);

bot.on("spawn", () => {
    console.log(`Bot spawned as ${bot.username}`);
    bot.chat("System Online. Brutal Defense & Auto-Armor Active.");
    
    const defaultMove = new pathfinder.Movements(bot, (bot as any).registry);
    bot.pathfinder.setMovements(defaultMove);
});

// --- BRUTAL PVP DEFENSE ---
bot.on('entityHurt', (entity) => {
    if (entity === bot.entity) {
        const attacker = bot.nearestEntity((e) => 
            (e.type === 'player' || e.type === 'mob') && 
            e.position.distanceTo(bot.entity.position) < 16
        );

        if (attacker) {
            bot.chat(`Target identified: ${attacker.username || attacker.name}. Commencing elimination.`);
            bot.pvp.attack(attacker); 
        }
    }
});

bot.on('stoppedAttacking', () => {
    bot.chat("Target neutralized.");
});

// Web server for Render
const http = require('http');
http.createServer((req: any, res: any) => {
    res.write("Bot is Live!");
    res.end();
}).listen(10000);

// Anti-AFK & Movement
setInterval(() => {
    const { x, y, z } = bot.entity.position;
    // Fixed the goals reference here too
    bot.pathfinder.setGoal(new pathfinder.goals.GoalNear(x + (Math.random() - 0.5) * 2, y, z + (Math.random() - 0.5) * 2, 0));
}, 30000);

bot.on("error", (err) => console.log("Error:", err));
bot.on("kicked", (reason) => console.log("Kicked:", reason));
