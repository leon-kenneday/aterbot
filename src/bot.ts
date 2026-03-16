import mineflayer from 'mineflayer';
// Fix the import for Node 22
import CONFIG from "../config.json" with { type: "json" }; 
import * as pathfinder from "mineflayer-pathfinder";

// Use require for these specific plugins to avoid ES Module errors
const pvp = require('mineflayer-pvp').plugin;
const armorManager = require('mineflayer-armor-manager');

let bot: mineflayer.Bot;

const createBot = (): void => {
    bot = mineflayer.createBot({
        host: CONFIG.client.host,
        port: Number(CONFIG.client.port),
        username: CONFIG.client.username,
        version: "1.21.1", // Forced version from your Aternos logs
        auth: "offline"
    });

    // Load Brutal Plugins
    bot.loadPlugin(pathfinder.pathfinder);
    bot.loadPlugin(pvp);
    bot.loadPlugin(armorManager);

    bot.on('spawn', () => {
        console.log(`[SYSTEM] Bot spawned as ${bot.username}`);
        bot.chat("Defense System Online. Do not touch me.");
        
        // Setup movements for PvP chasing
        const defaultMove = new pathfinder.Movements(bot, (bot as any).registry);
        bot.pathfinder.setMovements(defaultMove);
    });

    // --- BRUTAL DEFENSE LOGIC ---
    bot.on('entityHurt', (entity) => {
        if (entity === bot.entity) {
            const attacker = bot.nearestEntity((e) => 
                (e.type === 'player' || e.type === 'mob') && 
                e.position.distanceTo(bot.entity.position) < 16
            );
            if (attacker) {
                bot.chat(`Target Locked: ${attacker.username || attacker.name}. Initiating elimination.`);
                (bot as any).pvp.attack(attacker); 
            }
        }
    });

    // --- RECONNECT LOGIC ---
    bot.on('error', (err) => {
        console.error("Bot Error:", err);
        setTimeout(() => process.exit(1), 5000); // Forces Render to restart
    });

    bot.on('end', () => {
        console.log("Disconnected. Restarting...");
        setTimeout(() => process.exit(1), 5000);
    });

    bot.on('login', () => console.log("Bot logged in successfully!"));
};

export default (): void => {
    createBot();
};
