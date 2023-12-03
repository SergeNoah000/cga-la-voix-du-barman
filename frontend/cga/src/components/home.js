



import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ListPage from './listPage';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './../key'
import UpdateForm from './contrib-update';
import UserRegister from './user-register';

const HomePage = () => {
  const [searchName, setSearchName] = useState('');
  const [messagerr, setMessageerr] = useState('');
  const [contribuables, setContribuables] = useState([]);
  const [nouvelles, setNouvelles] = useState([]);
  const [userInf, setUserInf] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [showModal, setShowModal] = useState(-1);
  const navigateTo = useNavigate()
  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  const largeurEcran = window.innerWidth;
  const handleSearch = () => {
  const filteredByName = contribuables.filter((contribuable) =>
    contribuable.nomPrenoms.toLowerCase().includes(searchName.toLowerCase())
  );

  const filteredByOrigin = selectedOrigin
    ? contribuables.filter((contribuable) => contribuable.localisation === selectedOrigin)
    : contribuables;

  const filteredContribuables = [...new Set([...filteredByName, ...filteredByOrigin])];
  setContribuables(filteredContribuables);
};


  const handleReset = () => {
    setSearchName('');
    setSelectedOrigin('');
    setContribuables(contribuables);
  };
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

  useEffect(() => {
    // Charger la liste des contribuables depuis le backend
    const fetchContribuables = async () => {
      try {
         await axios.get(`http://${domainName}:8080/api/nouvelle-table`)
         .then((res)=>{
          setNouvelles(res.data);
         })
         .catch((err)=>{
          console.log(err);
          setMessageerr(err.message)
         })
        const response = await axios.get(`http://${domainName}:8080/api/contribuables`); // Assurez-vous que l'URL est correcte
        setContribuables(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des contribuables :', error.message);
      }
    };
    if (userInf.length === 0) {
      getUserInfos();
    }


    fetchContribuables();
  }, []);

  return (
  <div className="container mt-5">
  <div style={{display:'flex', flexDirection:'row', backgroundImage:`url('/logo512.png')` }}>
    <h2 className="mb-4 me-4">Liste des Contribuables</h2>
    <ListPage />
  </div>
  <div className="mb-3">
    <label className="form-label">Rechercher par nom :</label>
    <input
      type="text"
      className="form-control"
      value={searchName}
      onChange={(e) => setSearchName(e.target.value)}
    />
  </div>
  <div className="mb-3">
    <label className="form-label">Filtrer par Nom :</label>
    <select
      className="form-select"
      value={selectedOrigin}
      onChange={(e) => setSelectedOrigin(e.target.value)}
    >
      <option value="">Toutes les origines</option>
      {[...new Set(contribuables.map(fruit => fruit.localisation))].map((origin, index) => (
        <option key={index} value={origin}>{origin}</option>
      ))}
    </select>
  </div>
  <button className="btn btn-primary me-2" onClick={handleSearch}>Rechercher</button>
  <button className="btn btn-secondary" onClick={handleReset}>Réinitialiser</button>
  
  <span> Enregistrer un nouveau Contribuable <Link to='/contrib-register'> sur cette page</Link></span><br/>
            {userInf && userInf.role === 'administrateur' && ( <UserRegister />)} <br/>
  <button className="btn btn-warning me-2" onClick={(e)=>{
    sessionStorage.removeItem('userInfo');
    navigateTo('/login');
  }}>Deconnexion</button>

  {messagerr && (<><div style={{color:'red'}}><h3>{messagerr}</h3></div></>)}
      <table className="table table-striped table-bordered mt-4">
        <thead>
          <tr>
            <th>Code Client</th>
            <th>Noms et Prénoms</th>
            <th>NIU</th>
            <th>Paiement Inscription</th>
            <th>Paiement Cotisation</th>
            <th>Reste à Payer Inscription</th>
            <th>Reste à Payer Cotisation</th>
            <th>Numéro Tel</th>
            <th>CDI</th>
            <th>Localisation</th>
            <th>Distributeur</th>
            <th>CGA Actuel</th>
          </tr>
        </thead>
        <tbody>
          {contribuables.map((contribuable, index) => {
            const isNewContribuable = !nouvelles.some(
              (nouvelle) => nouvelle.raison_sociale.includes(contribuable.nomPrenoms)
            );
            const rowClass = isNewContribuable ? 'table-danger' : index % 2 === 0 ? 'table-primary' : 'table-secondary';
        return (
          <>
            <tr key={contribuable.id} className={rowClass} onClick={()=>{setShowModal(index)}} style={{ cursor:'pointer'}}>
              <td>{contribuable.codeClient}</td>
              <td>{contribuable.nomPrenoms}</td>
              <td>{contribuable.niu}</td>
              <td>{contribuable.paiementInscription}</td>
              <td>{contribuable.paiementCotisation}</td>
              <td>{contribuable.restePayerInscription}</td>
              <td>{contribuable.restePayerCotisation}</td>
              <td>{contribuable.numeroTel}</td>
              <td>{contribuable.cdi}</td>
              <td>{contribuable.localisation}</td>
              <td>{contribuable.distributeur}</td>
              <td>{contribuable.cgaActuel}</td>
            </tr>
            {userInf && userInf.role === 'administrateur' && (
            <>
            <div className={`modal`} tabIndex="-1" role="dialog" style={{display:showModal === index ? "block":"none"}}>
            <div className="modal-dialog" role="document">
              <div className="modal-content container mt-0" style={{position:'relative', wdth:`${largeurEcran-35}px`}}>
                <div className="modal-header">
                  <h5 className="modal-title">Mettez à jour</h5>
                  <button type="button" className="close" onClick={() => setShowModal(-1)} aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body row">
                  {/* Champ de fichier XLS */}
                  {<UpdateForm data={contribuable} />}
                </div>
              </div>
            </div>
          </div>
          </>)}
          </>
          )})}
        </tbody>
      </table>
    </div>
  );
};

export default HomePage;
