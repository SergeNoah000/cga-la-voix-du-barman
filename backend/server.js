import express  from 'express';
import cors from 'cors';
import knex from 'knex';
import fs from 'fs';
import excel from 'exceljs'
import  csv  from 'fast-csv';
import bodyParser from "body-parser";

import multer from 'multer';
import XLSX from 'xlsx';



const app = express();

const database = knex({
    client: 'mysql',
    connection: {
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'cga',
    },
  });


app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    const date = new Date().toUTCString();
    const { protocol, method, originalUrl } = req;
    const contentLength = req.headers['content-length'] || 0;
  
    res.on('finish', () => {
      const { statusCode } = res;
      console.log(`[${date}] ${protocol} ${method} ${originalUrl} ${statusCode} ${contentLength} bytes`);
    });
  
    next();
  });


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(8080, () => {
    console.log("Listening cga on 8080...");
})


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function processXLSXFile(filePath) {
  const workbook = new excel.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];
  const records = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {
      const record = row.values;
      records.push({
        // Mappez les colonnes de votre fichier Excel aux colonnes de votre table contribuables
        codeClient: record[1],
        nomPrenoms: record[2],
        niu: record[3],
        paiementInscription: record[4],
        paiementCotisation: record[5],
        restePayerInscription: record[6],
        restePayerCotisation: record[7],
        numeroTel: record[8],
        cdi: record[9],
        localisation: record[10],
        distributeur: record[11],
        cgaActuel: record[12],
      });
    }
  });

  // Insérez les données dans la base de données en utilisant Knex
  await database('contribuables').insert(records);
}


app.post('/api/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Recherchez l'utilisateur dans la base de données
      const user = await database('users').where({ username:username, password :password}).first();
  
      if (!user) {
        return res.status(401).json({ msg: 'Nom d\'utilisateur ou mot de passe incorrect !' });
      }
      res.json({user:user, msg:'Connexion reussie !!'});
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error on login  processing' });
    }
});


app.post('/api/user-register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Recherchez l'utilisateur dans la base de données
    const userExists = await database('users').where({ username: username, role: 'user' }).first();

    if (userExists) {
      return res.status(400).json({ msg: "L'utilisateur existe déjà dans la base de données !" });
    }

    // Enregistrez le nouvel utilisateur dans la base de données
    const newUser = await database('users').insert({ username: username, password: password, role: 'user' }).returning('*');

    res.status(201).json({ user: newUser[0], msg: 'Enregistrement réussi !' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error on user registration processing' });
  }
});

app.put('/api/contrib-update/:codeClient', async (req, res) => {
  try {
    const { codeClient } = req.params;
    const updatedContribuable = req.body;

    // Mettre à jour le client dans la base de données
    const updateResult = await database('contribuables')
      .where({ codeClient: codeClient })
      .update(updatedContribuable);

    if (updateResult === 0) {
      return res.status(404).json({ message: 'Client non trouvé.' });
    }

    res.json({ message: 'Client mis à jour avec succès.' });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du client :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du client.' });
  }
});



  // Route pour enregistrer un contribuable
app.post('/api/contrib-register', async (req, res) => {
  try {
    const {
      codeClient,
      nomPrenoms,
      niu,
      paiementInscription,
      paiementCotisation,
      restePayerInscription,
      restePayerCotisation,
      numeroTel,
      cdi,
      localisation,
      distributeur,
      cgaActuel,
    } = req.body;

    // Insérez les données du contribuable dans la table 'contribuables'
    await database('contribuables').insert({
      codeClient,
      nomPrenoms,
      niu,
      paiementInscription,
      paiementCotisation,
      restePayerInscription,
      restePayerCotisation,
      numeroTel,
      cdi,
      localisation,
      distributeur,
      cgaActuel,
    });

    res.json({ msg: 'Contribuable enregistré avec succès !' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur lors du traitement de l\'enregistrement du contribuable' });
  }
});

// Route pour récupérer la liste des contribuables
app.get('/api/contribuables', async (req, res) => {
  try {
    // Récupérer tous les contribuables depuis la table 'contribuables'
    const contribuables = await database.select().from('contribuables');
    res.json(contribuables);
  } catch (error) {
    console.error('Erreur lors de la récupération des contribuables :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des contribuables' });
  }
});

// Endpoint pour récupérer la liste des éléments avec la dernière date de modification
app.get('/api/nouvelle-table', async (req, res) => {
  try {
    // Utiliser knex pour récupérer les éléments avec la dernière date de modification
    const elements = await database('nouvelle_table')
      .where('update_date', '=', database('nouvelle_table').max('update_date'))
      .select();

    res.json(elements);
  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données.', error:error});
  }
});



// Endpoint pour la mise à jour en ligne
app.post('/mise-a-jour-en-ligne', upload.single('file'), async (req, res) => {
  try {
    // Convertir le fichier XLS en CSV
    const csvData = await convertXlsToCsv(req.file.buffer);

    // Insérer les données CSV dans la base de données
    await insertCsvIntoDatabase(csvData);

    res.status(200).json({ message: 'Mise à jour réussie.' });
  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

// Fonction pour convertir le fichier XLS en CSV
async function convertXlsToCsv(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(sheet);
  return csv;
}

// Fonction pour insérer les données CSV dans la base de données
async function insertCsvIntoDatabase(csvData) {
  const rows = csvData.split('\n').map(row => row.split(','));
  const headers = rows[0];
  
  // Supprimer la première ligne (headers) du tableau
  rows.shift();

  // Utiliser knex pour insérer les données dans la table contribuables
  await database('nouvelle_table').insert(rows.map(row => {
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });
    return rowData;
  }));
}
