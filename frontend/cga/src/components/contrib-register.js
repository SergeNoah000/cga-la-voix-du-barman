import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    codeClient: '',
    nomPrenoms: '',
    niu: '',
    statut: '',
    paiement: '',
    numeroTel: '',
    cdi: '',
    localisation: '',
    distributeur: '',
    cgaActuel: '',
    reste:0,
    ancienCga:'',
  });
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
      formData['cgaActuel'] = "LA VOIX DU BARMAN";
        // Envoi des données du formulaire à la route avec Axios
         await axios.post(`http://${domainName}:8080/api/contrib-register`, formData)
         .then((res)=>{
            console.log(res.data);
            setMessage(res.data.msg);
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
    console.log('Formulaire soumis :', formData);
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
              <label className="form-label">Statut</label>
              <select className="form-select" name="statut" 
                value={formData.statut}
                onChange={(e)=>{
                  setFormData({ ...formData, [e.target.name]: e.target.value });
                  if (e.target.value === "ancien") {
                    setFormData({ ...formData, ['reste']: 50000 });
                  } else {
                    setFormData({ ...formData, ['reste']: 75000 });                    
                  }
                }} required ></select>
              <option value="">------------</option>
              <option value="ancien"> Ancien </option>
              <option value="nouveau">   Nouveau   </option>
              
            </div>
            <div className="mb-3">
              <label className="form-label">Paiement Effectué pour la Cotisation</label>
              <input
                type="number"
                className="form-control"
                name="paiement"
                value={formData.paiement}
                onChange={(e)=>{
                  setFormData({ ...formData, [e.target.name]: e.target.value });
                  if (e.target.value === "ancien") {
                    setFormData({ ...formData, ['reste']: 50000-e.target.value });
                  } else {
                    setFormData({ ...formData, ['reste']: 75000-e.target.value });
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
                value={formData.reste}
                onChange={handleChange}
                disabled={true}
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
            {formData.statut && formData.statut === 'ancien' && (<>
            <div className="mb-3">
              <label className="form-label"> Ancien CGA </label>
              <input
                type="text"
                className="form-control"
                name="ancienCga"
                value={formData.ancienCga}
                onChange={handleChange}
              />
            </div>
            </>)}
          </div>
          {message && (<><h4 style={{color:'green'}}>{message}</h4></>)}
          {messagerr && (<><h4 style={{color:'red'}}>{messagerr}</h4></>)}
        </div>
        <button type="submit" className="btn btn-primary">Enregistrer</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
