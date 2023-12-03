import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


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
