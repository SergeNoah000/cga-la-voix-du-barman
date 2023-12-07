import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RegistrationForm = () => {
  const [codeClient, setCodeClient] = useState('');
  const [nomPrenoms, setNomPrenoms] = useState('');
  const [niu, setNiu] = useState('');
  const [statut, setStatut] = useState('');
  const [paiement, setPaiement] = useState('');
  const [numeroTel, setNumeroTel] = useState('');
  const [cdi, setCdi] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [distributeur, setDistributeur] = useState('');
  const [cgaActuel, setCgaActuel] = useState('');
  const [ancienCga, setAncienCga] = useState('');
  const [reste, setReste] = useState(0);
  const [message, setMessage] = useState('');
  const [messagerr, setMessager] = useState('');

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCgaActuel("LA VOIX DU BARMAN");

      const data = {
        codeClient : codeClient,
        raison_sociale : nomPrenoms,
        niu : niu,
        statut : statut,
        paiement : paiement,
        tel : numeroTel,
        codeunitegestion : cdi,
        localisation : localisation,
        distributeur: distributeur,
        cga : cgaActuel,
        ancienCga: ancienCga,
      }

      // Envoi des données du formulaire à la route avec Axios
      await axios.post(`http://${domainName}:8080/api/contrib-register`, data)
        .then((res) => {
          console.log(res.data);
          setMessage(res.data.msg);
          const id = setTimeout(() => {
            setMessager('');
            setAncienCga('');
            setCdi('');
            setCgaActuel('');
            setCodeClient('');
            setDistributeur('');
            setLocalisation('');
            setMessage('');
            setNiu('');
            setNomPrenoms('');
            setNumeroTel("");
            setReste(0);
            setPaiement('');
            setStatut('');

          }, 4000);
        
          // Définir une fonction de rappel pour annuler la temporisation
          const cancel = () => {
            clearTimeout(id);
          };
        
          // Annuler la temporisation après 5 secondes
          setTimeout(cancel, 5000);
        })
        .catch((err) => {
          console.log(err);
          setMessager(err.message);
          const id = setTimeout(() => {
            setMessager('');
          }, 4000);
        
          // Définir une fonction de rappel pour annuler la temporisation
          const cancel = () => {
            clearTimeout(id);
          };
        
          // Annuler la temporisation après 5 secondes
          setTimeout(cancel, 5000);
        });

      // Vous pouvez également rediriger l'utilisateur ou effectuer d'autres actions après la soumission réussie
    } catch (error) {
      // Gestion des erreurs (affichage, journalisation, etc.)
      console.error('Erreur lors de la soumission du formulaire :', error.message);
    }
    console.log('Formulaire soumis.\n');
  };

  return (
    <div className="container mt-5">
      <div className='block'><Link to='/'>Accueil</Link></div>
      <h2 className="mb-4">Enregistrement d'un Contribuable</h2>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Code Client</label>
              <input
                type="text"
                className="form-control"
                name="codeClient"
                value={codeClient}
                onChange={(e) => setCodeClient(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Noms et Prénoms</label>
              <input
                type="text"
                className="form-control"
                name="nomPrenoms"
                value={nomPrenoms}
                onChange={(e) => setNomPrenoms(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">NIU</label>
              <input
                type="text"
                className="form-control"
                name="niu"
                value={niu}
                onChange={(e) => setNiu(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Statut</label>
              <select className="form-select" name="statut" 
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value === "ancien") {
                    setReste(50000);
                  } else {
                    setReste(75000);
                  }
                }}
                required >
                <option value="">------------</option>
                <option value="ancien"> Ancien </option>
                <option value="nouveau"> Nouveau </option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Paiement Effectué pour la Cotisation</label>
              <input
                type="number"
                className="form-control"
                name="paiement"
                value={paiement}
                onChange={(e) => {
                  setPaiement(e.target.value);
                  if (statut === "ancien") {
                    setReste(50000 - e.target.value);
                  } else {
                    setReste(75000 - e.target.value);
                  }
                }}
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Reste à Payer</label>
              <input
                type="number"
                className="form-control"
                name="reste"
                value={reste}
                onChange={(e) => setReste(e.target.value)}
                disabled={true}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Numéro de Téléphone</label>
              <input
                type="tel"
                className="form-control"
                name="numeroTel"
                value={numeroTel}
                onChange={(e) => setNumeroTel(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">CDI</label>
              <input
                type="text"
                className="form-control"
                name="cdi"
                value={cdi}
                onChange={(e) => setCdi(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Localisation</label>
              <input
                type="text"
                className="form-control"
                name="localisation"
                value={localisation}
                onChange={(e) => setLocalisation(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Distributeur</label>
              <input
                type="text"
                className="form-control"
                name="distributeur"
                value={distributeur}
                onChange={(e) => setDistributeur(e.target.value)}
              />
            </div>
            {statut && statut === 'ancien' && (
              <div className="mb-3">
                <label className="form-label"> Ancien CGA </label>
                <input
                  type="text"
                  className="form-control"
                  name="ancienCga"
                  value={ancienCga}
                  onChange={(e) => setAncienCga(e.target.value)}
                />
              </div>
            )}
          </div>
          {message && (<><h4 style={{ color: 'green' }}>{message}</h4></>)}
          {messagerr && (<><h4 style={{ color: 'red' }}>{messagerr}</h4></>)}
        </div>
        <button type="submit" className="btn btn-primary">Enregistrer</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
