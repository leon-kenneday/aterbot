import mineflayer from "mineflayer";
import { pathfinder, Movements, goals } from "mineflayer-pathfinder";
// Use 'with' for Node 22 compatibility (fixes your 'assert' error)
import CONFIG from "../config.json" with { type: "json" }; 

// Import PVP plugin
const pvp = require('mineflayer-pvp').plugin;

const bot = mineflayer.createBot({
    host: CONFIG.client.host,
    port: CONFIG.client.port,
    username: CONFIG.client.username,
    version: CONFIG.client.version || false,
    auth: "offline"
});

// Load Plugins
bot.loadPlugin(pathfinder);
bot.loadPlugin(pvp);

bot.on("spawn", () => {
    console.log(`Bot spawned as ${bot.username}`);
    bot.chat("24/7 Defense System Active.");
    
    // Set default movements
    const defaultMove = new Movements(bot, (bot as any).registry);
    bot.pathfinder.setMovements(defaultMove);
});

// --- BRUTAL PVP DEFENSE LOGIC ---
bot.on('entityHurt', (entity) => {
    // If the bot itself is hit
    if (entity === bot.entity) {
        const attacker = bot.nearestEntity((e) => 
            (e.type === 'player' || e.type === 'mob') && 
            e.position.distanceTo(bot.entity.position) < 16
        );

        if (attacker) {
            bot.chat(`Target locked: ${attacker.username || attacker.name}. You will regret that.`);
            
            // Start the brutal attack
            bot.pvp.attack(attacker); 
        }
    }
});

// Taunt when target is eliminated
bot.on('stoppedAttacking', () => {
    if (bot.pvp.target) {
        bot.chat("Threat neutralized. Back to guard duty.");
    }
});

// Simple web server to keep Render happy
const http = require('http');
http.createServer((req: any, res: any) => {
    res.write("Bot is running!");
    res.end();
}).listen(10000);

// Anti-AFK: Move slightly every 30 seconds
setInterval(() => {
    const { x, y, z } = bot.entity.position;
    bot.pathfinder.setGoal(new goals.GoalNear(x + (Math.random() - 0.5) * 2, y, z + (Math.random() - 0.5) * 2, 0));
}, 30000);

bot.on("error", (err) => console.log("Error:", err));
bot.on("kicked", (reason) => console.log("Kicked:", reason));
