/* import React, { useState } from 'react';
import axios from 'axios';


const UpdateForm = (data) => {
  const [formData, setFormData] = useState(data.data);
  const [message, setMessage] = useState(''); 
  const [messagerr, setMessager] = useState(''); 

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Envoi des données du formulaire à la route avec Axios
        formData['created_at'] = new Date(formData['created_at']).toISOString().slice(0, 19).replace('T', ' ');
        formData['updated_at'] = null;
         await axios.put(`http://${domainName}:8080/api/contrib-update/${formData.codeClient}`, formData)
         .then((res)=>{
            console.log(res.data);
            setMessage(res.data.message);
         })
         .catch((err)=>{
            console.log(err);
            setMessager(err.message);
         })
  
        // Vous pouvez également rediriger l'utilisateur ou effectuer d'autres actions après la soumission réussie
      } catch (error) {
        // Gestion des erreurs (affichage, journalisation, etc.)
        console.error('Erreur lors de la soumission du formulaire :', error.message);
      }
    console.log('Formulaire soumis ');
  };

  return (
    <div className="container mt-2">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Code Client</label>
              <input
                type="text"
                className="form-control"
                name="codeClient"
                value={formData.codeClient}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Noms et Prénoms</label>
              <input
                type="text"
                className="form-control"
                name="nomPrenoms"
                value={formData.nomPrenoms}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">NIU</label>
              <input
                type="text"
                className="form-control"
                name="niu"
                value={formData.niu}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Paiement Effectué pour l'Inscription</label>
              <input
                type="number"
                className="form-control"
                name="paiementInscription"
                value={formData.paiementInscription}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Paiement Effectué pour la Cotisation</label>
              <input
                type="number"
                className="form-control"
                name="paiementCotisation"
                value={formData.paiementCotisation}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Reste à Payer pour l'Inscription</label>
              <input
                type="number"
                className="form-control"
                name="restePayerInscription"
                value={formData.restePayerInscription}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Reste à Payer pour la Cotisation</label>
              <input
                type="number"
                className="form-control"
                name="restePayerCotisation"
                value={formData.restePayerCotisation}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Numéro de Téléphone</label>
              <input
                type="tel"
                className="form-control"
                name="numeroTel"
                value={formData.numeroTel}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">CDI</label>
              <input
                type="text"
                className="form-control"
                name="cdi"
                value={formData.cdi}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Localisation</label>
              <input
                type="text"
                className="form-control"
                name="localisation"
                value={formData.localisation}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Distributeur</label>
              <input
                type="text"
                className="form-control"
                name="distributeur"
                value={formData.distributeur}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">CGA Actuel</label>
              <input
                type="text"
                className="form-control"
                name="cgaActuel"
                value={formData.cgaActuel}
                onChange={handleChange}
              />
            </div>
          </div>
          {message && (<><h4 style={{color:'green'}}>{message}</h4></>)}
          {messagerr && (<><h4 style={{color:'red'}}>{messagerr}</h4></>)}
        </div>
        <button type="submit" className="btn btn-primary">Enregistrer</button>
      </form>
    </div>
  );
};

export default UpdateForm;
 */
import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const UpdateForm = (data) => {
  const [raisonSociale, setRaisonSociale] = useState(data.data.raison_sociale);
  const [sigleCga, setSigleCga] = useState(data.data.siglecga);
  const [activitePrincipale, setActivitePrincipale] = useState(data.data.activite_principale);
  const [niu, setNiu] = useState(data.data.niu);
  const [tel, setTel] = useState(data.data.tel);
  const [email, setEmail] = useState(data.data.email);
  const [codeRegime, setCodeRegime] = useState(data.data.coderegime);

  const [sigle, setSigle] = useState(data.data.sigle);
  const [cga, setCga] = useState(data.data.cga);
  const [uniteGestion, setUniteGestion] = useState(data.data.unite_gestion);
  const [statut, setStatut] = useState(data.data.statut);
  const [distributeur, setDistributeur] = useState(data.data.distributeur);
  const [ancienCga, setAncienCga] = useState(data.data.ancienCga);
  const [paiementInscription, setPaiementInscription] = useState(data.data.paiement);
  const [codeClient, setCodeClient] = useState(data.data.codeClient);

  const [message, setMessage] = useState('');
  const [messagerr, setMessager] = useState('');

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  const navagateTo = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        id: data.data.id,
        raison_sociale: raisonSociale,
        siglecga: sigleCga,
        activite_principale: activitePrincipale,
        niu,
        tel,
        email,
        coderegime: codeRegime,
        sigle,
        cga,
        unite_gestion: uniteGestion,
        statut,
        distributeur,
        ancienCga,
        paiement:paiementInscription,
        codeClient,
        creation_date: new Date(data.data.creation_date).toISOString().slice(0, 19).replace('T', ' '),
        update_date: null,
      };

      await axios.put(`http://${domainName}:8080/api/contrib-update/${formData.id}`, formData)
        .then((res) => {
          setMessage(res.data.message);
          const id = setTimeout(() => {
            setMessager('');
            navagateTo('/')
          }, 4000);

          const cancel = () => {
            clearTimeout(id);
          };

          setTimeout(cancel, 5000);
        })
        .catch((err) => {
          console.log(err);
          setMessager(err.message);
          const id = setTimeout(() => {
            setMessager('');
          }, 4000);

          const cancel = () => {
            clearTimeout(id);
          };

          setTimeout(cancel, 5000);
        });
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire :', error.message);
    }
  };


  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            

            <div className="mb-3">
              <label className="form-label">Raison Sociale</label>
              <input
                type="text"
                className="form-control"
                value={raisonSociale}
                onChange={(e) => setRaisonSociale(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Sigle</label>
              <input
                type="text"
                className="form-control"
                value={sigleCga}
                onChange={(e) => setSigleCga(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Activité Principale</label>
              <input
                type="text"
                className="form-control"
                value={activitePrincipale}
                onChange={(e) => setActivitePrincipale(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">NIU</label>
              <input
                type="text"
                className="form-control"
                value={niu}
                onChange={(e) => setNiu(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Téléphone</label>
              <input
                type="tel"
                className="form-control"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Code Régime</label>
              <input
                type="text"
                className="form-control"
                value={codeRegime}
                onChange={(e) => setCodeRegime(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Sigle CGA</label>
              <input
                type="text"
                className="form-control"
                value={sigle}
                onChange={(e) => setSigle(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">CGA Actuel</label>
              <input
                type="text"
                className="form-control"
                value={cga}
                onChange={(e) => setCga(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Unité de Gestion</label>
              <input
                type="text"
                className="form-control"
                value={uniteGestion}
                onChange={(e) => setUniteGestion(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Statut Inscription</label>
              <input
                type="text"
                className="form-control"
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Distributeur</label>
              <input
                type="text"
                className="form-control"
                value={distributeur}
                onChange={(e) => setDistributeur(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Ancien CGA</label>
              <input
                type="text"
                className="form-control"
                value={ancienCga}
                onChange={(e) => setAncienCga(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Paiement Inscription</label>
              <input
                type="number"
                className="form-control"
                value={paiementInscription}
                onChange={(e) => setPaiementInscription(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Code Client</label>
              <input
                type="text"
                className="form-control"
                value={codeClient}
                onChange={(e) => setCodeClient(e.target.value)}
              />
            </div>
          </div>

          {message && (<h4 style={{ color: 'green' }}>{message}</h4>)}
          {messagerr && (<h4 style={{ color: 'red' }}>{messagerr}</h4>)}
        </div>

        <button type="submit" className="btn btn-primary">
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default UpdateForm;
