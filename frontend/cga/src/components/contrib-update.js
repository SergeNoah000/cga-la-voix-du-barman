
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
      const formData = new FormData();
  
      formData.append('id', data.data.id);
      formData.append('raison_sociale', raisonSociale);
      formData.append('siglecga', sigleCga);
      formData.append('activite_principale', activitePrincipale);
      formData.append('niu', niu);
      formData.append('tel', tel);
      formData.append('email', email);
      formData.append('coderegime', codeRegime);
      formData.append('sigle', sigle);
      formData.append('cga', cga);
      formData.append('unite_gestion', uniteGestion);
      formData.append('statut', statut);
      formData.append('distributeur', distributeur);
      formData.append('ancienCga', ancienCga);
      formData.append('paiement', paiementInscription);
      formData.append('codeClient', codeClient);
      formData.append('creation_date', new Date(data.data.creation_date).toISOString().slice(0, 19).replace('T', ' '));
      formData.append('update_date', null);
      formData.append("api/contrib-update", "something");
  
      await axios.post(`https://cga-legionweb.cocga-server.php`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((res) => {
        setMessage(res.data.message);
        const id = setTimeout(() => {
          setMessager('');
          navagateTo('/');
        }, 4000);
  
        const cancel = () => {
          clearTimeout(id);
        };
  
        setTimeout(cancel, 5000);
      })
      .catch((error) => {
        console.log(error);
        if (error.message && error.message === "Network Error") {
          const data1 = [{
            id: data.data.id,
            raison_sociale: raisonSociale,
            siglecga: sigleCga,
            activite_principale: activitePrincipale,
            niu, tel, email,
            coderegime: codeRegime,
            sigle,
            cga, unite_gestion: uniteGestion,
            statut, distributeur,
            ancienCga,
            paiement: paiementInscription,
            codeClient,
            creation_date: new Date(data.data.creation_date).toISOString().slice(0, 19).replace('T', ' '),
            update_date: null,
          }];
  
          const after =  JSON.parse(localStorage.getItem('updateFormData'));
          if (after) {
            after.push(...data1);
            localStorage.setItem('updateFormData', JSON.stringify(after));
          } else {
            localStorage.setItem('updateFormData', JSON.stringify(data1));
          }
  
          setMessager('');
          setMessage("Stocké en local en attente d'une connexion internet.");
          
  
          const id = setTimeout(() => {
            setMessage('');
          navagateTo('/');
          }, 4000);
  
          const cancel = () => {
            clearTimeout(id);
          };
  
          setTimeout(cancel, 5000);
        } else {
          setMessager(error.message);
          const id = setTimeout(() => {
            setMessager('');
          }, 4000);
  
          const cancel = () => {
            clearTimeout(id);
          };
  
          setTimeout(cancel, 5000);
        }
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
                type="text"
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
