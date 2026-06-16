const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = '/servers/cloud/hub.db';
console.log(`Connecting to Hub database at ${dbPath}...`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to Hub database:', err.message);
    process.exit(1);
  }
  console.log('Connected successfully.');
});

db.serialize(() => {
  // 1. Register Alchemist's Crucible Application
  const appId = 'alchemists-crucible';
  
  db.get('SELECT id FROM apps WHERE id = ?', [appId], (err, row) => {
    if (err) {
      console.error('Error querying apps table:', err.message);
      process.exit(1);
    }

    if (row) {
      console.log(`Application "${appId}" is already registered in the Hub.`);
    } else {
      console.log(`Registering application "${appId}"...`);
      const now = new Date().toISOString();
      const appData = {
        id: appId,
        title: "Alchemist's Crucible",
        developer: "KBS Cloud Games",
        publisher: "KBS Cloud",
        release_date: "June 2026",
        description: "Synthesize elements, transmute substances, and achieve the ultimate formula in this alchemical crafting game.",
        full_description: "Welcome to the Alchemist's Crucible, a game of magical crafting and state mutation. Synthesize rare elements, queue transmutations, and race against other apprentices to create the Philosopher's Stone.",
        tags: JSON.stringify(["Crafting", "Strategy", "Multiplayer", "Alchemical"]),
        features: JSON.stringify([
          "Interactive element synthesis",
          "Local and online multiplayer support",
          "Apprentice presence tracking",
          "Achievements integration"
        ]),
        system_requirements: JSON.stringify({
          os: "Ubuntu 22.04+, Windows 10/11, macOS 12+",
          cpu: "Intel Core i5 / AMD Ryzen 5 or better",
          memory: "4 GB RAM",
          graphics: "Integrated Graphics",
          storage: "100 MB available space"
        }),
        prod_url: "https://alchemists-crucible.kbs-cloud.com",
        dev_url: "http://localhost:19004", // Point dev_url to the production frontend port since it's the port the user will access locally
        github_url: "https://github.com/kbs-cloud/alchemists-crucible",
        download_url: "https://github.com/kbs-cloud/alchemists-crucible/releases",
        cover_image: "/alchemists_crucible_cover.png",
        icon: "🧪",
        is_online: 1,
        is_multiplayer: 1,
        app_token: "alchemist_token_dev_777",
        created_at: now,
        updated_at: now
      };

      const fields = Object.keys(appData);
      const placeholders = fields.map(() => '?').join(', ');
      const sql = `INSERT INTO apps (${fields.join(', ')}) VALUES (${placeholders})`;
      
      db.run(sql, Object.values(appData), (insErr) => {
        if (insErr) {
          console.error('Failed to register application:', insErr.message);
          process.exit(1);
        }
        console.log(`Application "${appId}" registered successfully.`);
      });
    }
  });

  // 2. Register Achievements
  const achievements = [
    {
      id: 'alchemist_philosophers_stone',
      app_id: appId,
      title: "Philosopher's Stone",
      description: "Achieved victory in a game of Alchemist's Crucible.",
      icon: "🧪",
      xp_value: 100,
      hidden: 0
    },
    {
      id: 'alchemist_ultimate_transmutation',
      app_id: appId,
      title: "Ultimate Transmutation",
      description: "Synthesized the ultimate alchemical element.",
      icon: "☀️",
      xp_value: 250,
      hidden: 0
    }
  ];

  achievements.forEach((ach) => {
    db.get('SELECT id FROM achievements WHERE id = ?', [ach.id], (err, row) => {
      if (err) {
        console.error(`Error querying achievements for ${ach.id}:`, err.message);
        return;
      }

      if (row) {
        console.log(`Achievement "${ach.id}" is already registered.`);
      } else {
        console.log(`Registering achievement "${ach.id}"...`);
        const now = new Date().toISOString();
        db.run(
          'INSERT INTO achievements (id, app_id, title, description, icon, xp_value, hidden, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [ach.id, ach.app_id, ach.title, ach.description, ach.icon, ach.xp_value, ach.hidden, now],
          (insErr) => {
            if (insErr) {
              console.error(`Failed to register achievement "${ach.id}":`, insErr.message);
            } else {
              console.log(`Achievement "${ach.id}" registered successfully.`);
            }
          }
        );
      }
    });
  });
});


