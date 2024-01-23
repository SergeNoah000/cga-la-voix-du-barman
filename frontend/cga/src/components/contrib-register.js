import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './../key'

const RegistrationForm = () => {
  const [codeClient, setCodeClient] = useState('');
  const [nomPrenoms, setNomPrenoms] = useState('');
  const [niu, setNiu] = useState('');
  const [paiement, setPaiement] = useState('');
  const [numeroTel, setNumeroTel] = useState('');
  const [cdi, setCdi] = useState('');
  const [userInf, setUserInf] = useState([]);
  const [localisation, setLocalisation] = useState('');
  const [distributeur, setDistributeur] = useState('');
  const [cgaActuel, setCgaActuel] = useState('');
  const [ancienCga, setAncienCga] = useState('');
  const [reste, setReste] = useState(0);
  const [statut, setStatut] = useState('');
  const [message, setMessage] = useState('');
  const [messagerr, setMessager] = useState('');

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');



  const navigateTo = useNavigate();


  function getUserInfos(){
    try {
        const encryptedData = sessionStorage.getItem('userInfo');
        if (encryptedData) {
            const decryptedData = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
            if (decryptedData) {
            const userInfo = JSON.parse(decryptedData);
            setUserInf(userInfo)
            }
        }else{
            navigateTo('/login');
        }}catch(err){
            
    }
}




const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setCgaActuel("LA VOIX DU BARMAN");

    const formData = new FormData();

    formData.append('codeClient', codeClient);
    formData.append('raison_sociale', nomPrenoms);
    formData.append('niu', niu);
    formData.append('statut', statut);
    formData.append('paiement', paiement);
    formData.append('tel', numeroTel);
    formData.append('codeunitegestion', cdi);
    formData.append('localisation', localisation);
    formData.append('distributeur', distributeur);
    formData.append('cga', cgaActuel.trim() === '' ? 'LA VOIX DU BARMAN' : cgaActuel);
    formData.append('ancienCga', ancienCga);
    formData.append('userId', userInf.id);
    formData.append("api/contrib-register", "something");

    // Envoi des données du formulaire à la route avec Axios ${domainName}:8080/api/contrib-register
    await axios.post(`https://cga-legionweb.cocga-server.php`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then((res) => {
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
    .catch((error) => {
      console.log(error);
      if (error.message && error.message === "Network Error") {
        const data = [{
          codeClient : codeClient,
          raison_sociale : nomPrenoms,
          niu : niu,
          statut : statut,
          paiement : paiement,
          tel : numeroTel,
          codeunitegestion : cdi,
          localisation : localisation,
          distributeur: distributeur,
          cga : cgaActuel.trim() === ''?"LA VOIX DU BARMAN": cgaActuel,
          ancienCga: ancienCga,
          userId:userInf.id,
        },];
  
          // Stoker les données du formulaire dans le localStorage
          const after =  JSON.parse(localStorage.getItem('formData'));
          if(after){
            after.push(...data);
          localStorage.setItem('formData', JSON.stringify(after));
        }else{
          localStorage.setItem('formData', JSON.stringify(data));
        }
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
  
          setMessage(" Stocker en local en attente d'une connexion internet. ");
          const id = setTimeout(() => {
            setMessage('');
          }, 4000);
  
          // Définir une fonction de rappel pour annuler la temporisation
          const cancel = () => {
            clearTimeout(id);
          };
  
          // Annuler la temporisation après 5 secondes
          setTimeout(cancel, 5000);
      }else{
      setMessager(error.message);
      const id = setTimeout(() => {
        setMessager('');
      }, 4000);

      // Définir une fonction de rappel pour annuler la temporisation
      const cancel = () => {
        clearTimeout(id);
      };

      // Annuler la temporisation après 5 secondes
      setTimeout(cancel, 5000);
    }});
  }
  catch (error) {
    // Gestion des erreurs (affichage, journalisation, etc.)
    console.error('Erreur lors de la soumission du formulaire :', error.message);
  }
};



  useEffect(() => {
    if (userInf.length === 0) {
      getUserInfos();
    }
  }, []);
  return (
    <div className="container mt-5">
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
                className={ nomPrenoms.length> 0 ? "form-control is-valid":"form-control"}
                name="nomPrenoms"
                onBlur={(e) => setNomPrenoms(e.target.value)}
                required
              />
              <div class="valid-feedback">
              
            </div>
            </div>
            <div className="mb-3 ">
              <label className="form-label">NIU</label>
              <input
                type="text"
                className={niu.length> 0 && niu.length !== 14 ? "form-control is-invalid" : niu.length === 14 ? "form-control is-valid": "form-control"}
                name="niu"
                onBlur={(e) => setNiu(e.target.value)}
                
              />
              <div class="invalid-feedback">
              Le nui doit compter 14 caractère
            </div>
            <div class="valid-feedback">
            </div>

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
                required
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
