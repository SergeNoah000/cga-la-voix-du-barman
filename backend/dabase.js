import knex from 'knex';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './key.js'

const database = knex({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cga',
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  useNullAsDefault: true, 
});



function encryptTextWithKey(text, ke) {
  const key = CryptoJS.enc.Utf8.parse(ke)
  const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: key,
      mode: CryptoJS.mode.ECB
    });
    const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64).toString();
    return ciphertext;

}

async function createTables() {

// Table "users"
const tableExists = await database.schema.hasTable('users');
if (!tableExists) {
  await database.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('password').notNullable();
    table.text('description').nullable();
    table.string('email').nullable().unique();
    table.bigInteger('numTel').nullable().unique();
    table.date('creationDate').nullable();
    table.date('updateDate').nullable();
    table.string('role').nullable();
  });
  console.log(' Table "users" created in database');
  try {
    await database('users').insert({
        username: "admin",
        password: encryptTextWithKey("cga-admin", ENCRYPTION_KEY.ENCRYPTION_KEY),
        role:'administrateur',
        creationDate: database.raw('now()'),
        updateDate: database.raw('now()'),
        description: "Administrateur suppreme du site",
      });
    console.info("Default user created: \n username: 'admin'\n password: 'cga-admin' \n ");
  } catch (error) {
      console.log(error);
    }
}

const contribuables = await database.schema.hasTable('contribuables');

if (!contribuables) {
  await database.schema.createTable('contribuables', (table) => {
    table.increments('id').primary();
    table.string('n°');
    table.string('raison_sociale');
    table.string('sigle');
    table.string('niu');
    table.string('activite_principale');
    table.string('tel');
    table.string('email');
    table.string('coderegime');
    table.string('regime');
    table.string('siglecga');
    table.string('cga');
    table.string('codeunitegestion');
    table.string('unite_gestion');
    table.string('codeClient').nullable().unique();
    table.bigInteger('paiement').notNullable().default(0);
    table.string('statut').notNullable().default("nouveau");
    table.string('localisation').nullable();
    table.string('distributeur').nullable();
    table.string('ancienCga').nullable();
    table.dateTime('creation_date').defaultTo(database.fn.now());
    table.dateTime('update_date').defaultTo(database.fn.now());
  });

  console.log('Table "nouvelle_table" créée dans la base de données');
}


}



createTables()
  .then(() => {
    console.log('Tables created successfully.');
    database.destroy(); // Fermeture de la connexion à la base de données
  })
  .catch((error) => {
    console.error('Error creating tables:', error);
    database.destroy(); // Fermeture de la connexion à la base de données
  });


export default database;