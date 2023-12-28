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
     pool: {
    min: 10, // Valeur minimale de connexions
    max: 100, // Valeur maximale de connexions
    // Autres paramètres de pool
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
        return res.status(202).json({ msg: 'Nom d\'utilisateur ou mot de passe incorrect !' });
      }
      res.json({user:user, msg:'Connexion reussie !!'});
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error on login  processing' });
    }
});


app.post('/api/user-register', async (req, res) => {
  try {
    const { username, password, fullname } = req.body;

    // Recherchez l'utilisateur dans la base de données
    const userExists = await database('users').where({ username: username, role: 'user', fullname:fullname }).first();

    if (userExists) {
      return res.status(203).json({ msg: "L'utilisateur existe déjà dans la base de données !" });
    }

    // Enregistrez le nouvel utilisateur dans la base de données
    const newUser = await database('users').insert({ username: username, password: password, role: 'user',fullname:fullname }).returning('*');

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
    const contribuables = await database.select().from('contribuables').where("validate", true).orderBy('id', 'desc').offset(offset).limit(pageSize);

    res.json(contribuables);
  } catch (error) {
    console.error('Erreur lors de la récupération des contribuables :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des contribuables' });
  }
});

// Route pour la recherche
app.post('/api/search', async (req, res) => {
  try {
    // Extraire les paramètres de recherche du corps de la requête
    const { niu, raisonSociale, sigle, numeroTel, localisation } = req.body;

    // Construire la requête SQL en fonction des paramètres de recherche
    const query = database('contribuables')
      .select()
      .where(builder => {
        if (niu) builder.orWhere('niu', 'like', `%${niu}%`);
        if (raisonSociale) builder.orWhere('raison_sociale', 'like', `%${raisonSociale}%`);
        if (sigle) builder.orWhere('sigle', 'like', `%${sigle}%`);
        if (numeroTel) builder.orWhere('tel', 'like', `%${numeroTel}%`);
        if (localisation) builder.orWhere('localisation', 'like', `%${localisation}%`);
      })
      .andWhere("validate", true)
      .orderBy('id', 'desc');
    // Exécuter la requête
    const results = await query;

    // Renvoyer les résultats de la recherche
    res.json(results);
  } catch (error) {
    console.error('Erreur lors de la recherche :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la recherche' });
  }
});

// Route pour la valider/invalider
app.post('/api/contrib/validate', async (req, res) => {
  try {
    // Extraire les paramètres de recherche du corps de la requête
    const { niu, valide } = req.body;
    console.log(req.body)
    // Mettre à jour le client dans la base de données
    const updateResult = await database('contribuables')
      .where("niu", niu )
      .update({validate: valide, traite: true})
      .orderBy('id', 'desc');
    if (!updateResult) {
      return res.status(204).json({ message: 'Client non trouvé.', req: req.body });
    }

    res.json({ message: 'Client mis à jour avec succès.', updateResult: updateResult });

  } catch (error) {
    console.error('Erreur lors de la validation :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la recherche' });
  }
});



// Route pour la valider/invalider
app.get('/api/contribs/renew', async (req, res) => {
  try {
    // Mettre à jour le client dans la base de données
    const updateResult = await database('contribuables')
      .update({paiement: 0})
    if (!updateResult) {
      return res.status(204).json({ message: 'Erreur', req: req.body });
    }

    res.json({ message: 'Mis à jour avec succès.', updateResult: updateResult });

  } catch (error) {
    console.error('Erreur lors de la mise a jour totale :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la mise à jour toatale' });
  }
});



app.get('/api/contribuables/all', async (req, res) => {
  try {
    const contribuables = await database.select().from('contribuables').where("validate", true).orderBy('id', 'desc');

    res.json(contribuables);
  } catch (error) {
    console.error('Erreur lors de la récupération des contribuables :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des contribuables' });
  }
});

app.get('/api/contribuables/validate', async (req, res) => {
  try {
    const contribuables = await database.select().from('contribuables')
    .join("users", "contribuables.userId", "users.id")
    .where( "traite", false);

    res.json(contribuables);
  } catch (error) {
    console.error('Erreur lors de la récupération des contribuables :', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des contribuables' });
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
        ancienCga : record[12],
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
  
  // Récupérer l'index de la colonne 'cga'
  const cgaIndex = headers.indexOf('CGA');

  if (cgaIndex !== -1) {
    headers.push('ancienCga'); // Ajouter 'ancienCga' aux headers
    rows.forEach(row => {
      row.push(row[cgaIndex]); // Assigner la valeur de 'cga' à 'ancienCga' pour chaque ligne
    });
  }


  // Utiliser knex pour insérer les données dans la table contribuables
  await database('contribuables').insert(rows.map(row => {
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });

      rowData['ancienCga'] = rowData['CGA'];
      rowData['traite'] = true;
      rowData['validate'] = true;
    return rowData; 
  }));
}


// Endpoint pour la comparaison et la mise à jour de la base de données
app.post('/api/dgi-compare', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer; // Supposons que le fichier xlsx est envoyé sous la forme d'un buffer
    if (!fileBuffer) {
    res.status(200).json({ message: 'Pas de fichier XLS envoyé, réessayéz.', contribuables: null });
    }
    // Convertir le fichier XLSX en données utilisables
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Diviser le tableau en lots de données pour traiter un nombre limité d'entrées à la fois
    const batchSize = 100; // Nombre d'entrées à traiter dans un lot
    const totalEntries = sheetData.length;
    const batchCount = Math.ceil(totalEntries / batchSize);

    for (let i = 0; i < batchCount; i++) {
      const start = i * batchSize;
      const end = start + batchSize;
      const batch = sheetData.slice(start, end);

      const niuList = batch.map(entry => entry.NIU);
      const databaseNIUList = await database('contribuables').pluck('niu');

      await Promise.all(databaseNIUList.map(async niu => {
        const isUpToDate = niuList.includes(niu);
        await database('contribuables')
          .where('niu', niu)
          .update({ upToDate: isUpToDate });
      }));
    }

    const updatedData = await database('contribuables').select('*').orderBy('upToDate', 'asc');

    res.status(200).json({ message: 'Comparaison et mise à jour réussies.', contribuables: updatedData });
  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ error: 'Erreur lors de la comparaison et de la mise à jour.' });
  }
});

/*
// Endpoint pour la comparaison et la mise à jour de la base de données
app.post('/api/dgi-compare', upload.single('file'), async (req, res) => {
  try {
    const fileBuffer = req.file.buffer; // Supposons que le fichier xlsx est envoyé sous la forme d'un buffer
    if (!fileBuffer) {
      return res.status(200).json({ message: 'Pas de fichier XLS envoyé, réessayez.', contribuables: null });
    }

    // Convertir le fichier XLSX en données utilisables
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const batchSize = 100; // Taille du lot
    const totalEntries = sheetData.length;
    const batchCount = Math.ceil(totalEntries / batchSize);

    // Envoi de l'entête SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Utilisation de transaction par lot
    for (let i = 0; i < batchCount; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, totalEntries);
      const batch = sheetData.slice(start, end);

      await database.transaction(async (trx) => {
        for (const entry of batch) {
          await database('contribuables')
            .transacting(trx)
            .where('niu', entry.NIU)
            .update({ upToDate: entry.someProperty });
        }
      });

      // Calcul du pourcentage de traitement
      const progressPercentage = ((i + 1) / batchCount) * 100;

      // Envoi du pourcentage de progression au frontend via SSE
      res.write(`data: ${progressPercentage.toFixed(2)}%\n\n`);
      await sleep(1000); // Attente pour simuler le traitement
    }

    const updatedData = await database('contribuables').select('*').orderBy('upToDate', 'asc');

    res.status(200).json({ message: 'Comparaison et mise à jour réussies.', contribuables: updatedData }).end();
     // Terminaison de la connexion SSE
  } catch (error) {
    console.error('Erreur :', error);
    res.status(500).json({ error: 'Erreur lors de la comparaison et de la mise à jour.' });
  }
});

// Fonction d'attente
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
*/