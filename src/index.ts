import mineflayer from "mineflayer";
import * as pathfinder from "mineflayer-pathfinder";
import CONFIG from "../config.json" with { type: "json" }; 

// Fixed imports for ES Modules
import pvp from 'mineflayer-pvp';
import armorManager from 'mineflayer-armor-manager';
import http from 'http';

const bot = mineflayer.createBot({
    host: CONFIG.client.host,
    port: Number(CONFIG.client.port), // This converts "50060" to 50060
    username: CONFIG.client.username,
    version: "1.21.1", // Force the version to match your Aternos log
    auth: "offline"
});

// Load Plugins
bot.loadPlugin(pathfinder.pathfinder);
bot.loadPlugin(pvp.plugin);
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
            (bot as any).pvp.attack(attacker); 
        }
    }
});

// Web server to prevent Render "Port Scan Timeout" and sleep
http.createServer((req, res) => {
    res.write("Bot is Live!");
    res.end();
}).listen(10000);

// Anti-AFK & Movement
setInterval(() => {
    const { x, y, z } = bot.entity.position;
    bot.pathfinder.setGoal(new pathfinder.goals.GoalNear(x + (Math.random() - 0.5) * 2, y, z + (Math.random() - 0.5) * 2, 0));
}, 30000);

bot.on("error", (err) => console.log("Error:", err));
bot.on("kicked", (reason) => console.log("Kicked:", reason));
bot.on('death', () => {
    bot.chat("You can't kill a machine. Respawning...");
    // No extra code needed, mineflayer usually respawns automatically 
    // unless it gets kicked for dying too many times.
});

