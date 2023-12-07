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
    console.log(updatedContribuable);

    // Mettre à jour le client dans la base de données
    const updateResult = await database('contribuables')
      .where({ id: codeClient })
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

    // Insérez les données du contribuable dans la table 'contribuables'
    await database('contribuables').insert(req.body);

    res.json({ msg: 'Contribuable enregistré avec succès !' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur interne du serveur lors du traitement de l\'enregistrement du contribuable' });
  }
});

// Route pour récupérer la liste des contribuables avec pagination
app.get('/api/contribuables', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const pageSize = 20; // Nombre d'éléments par page

    // Calculer l'offset en fonction de la page
    const offset = (page - 1) * pageSize;

    // Récupérer les contribuables avec pagination depuis la table 'contribuables'
    const contribuables = await database.select().from('contribuables').offset(offset).limit(pageSize);

    res.json(contribuables);
  } catch (error) {
    console.error('Erreur lors de la récupération des contribuables :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des contribuables' });
  }
});

/* 
app.get('/api/contribuables', async (req, res) => {
  try {
    const contribuables = await database.select().from('contribuables');

    res.json(contribuables);
  } catch (error) {
    console.error('Erreur lors de la récupération des contribuables :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des contribuables' });
  }
});
 */
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
  await database('contribuables').insert(rows.map(row => {
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });
    return rowData;
  }));
}
