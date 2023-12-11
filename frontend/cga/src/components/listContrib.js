import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import UpdateForm from './contrib-update';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './../key';
import { useNavigate } from 'react-router-dom';

const ListContrib = () => {
  const [contribuables, setContribuables] = useState([]);
  const [messagerr, setMessagerr] = useState('');
  const [showModal, setShowModal] = useState(-1);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userInf, setUserInf] = useState([]);

  const navigateTo = useNavigate();
  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  const largeurEcran = window.innerWidth;

  function getUserInfos() {
    try {
      const encryptedData = sessionStorage.getItem('userInfo');
      if (encryptedData) {
        const decryptedData = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        if (decryptedData) {
          const userInfo = JSON.parse(decryptedData);
          setUserInf(userInfo);
        }
      } else {
        navigateTo('/login');
      }
    } catch (err) {
      console.error(err);
    }
  }

  const fetchContribuables = async () => {
    try {
      
      const response = await axios.get(`http://${domainName}:8080/api/contribuables/all`);
      setDone(true)
      setContribuables(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des contribuables :', error.message);
      setMessagerr('Erreur lors du chargement des contribuables.');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    setLoading(true);
    fetchContribuables();
  };

  useEffect(() => {
    if (userInf.length === 0) {
      getUserInfos();
    }
  }, []);

  return (
    <div className='container  mb-4'>
      <Button
        variant="primary"
        onClick={handleClick}
        style={{display: !done?"-moz-initial":"none"}}
      >
        {loading ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span className="visually-hidden">Chargement...</span>
          </>
        ) : (
          'Cliquez pour Charger'
        )}
      </Button>
      {contribuables.length === 0 && !loading && <p>Aucun contribuable trouvé.</p>}
      {contribuables.length > 0 && (
      <>
          {messagerr && (<><div style={{color:'red'}}><h3>{messagerr}</h3></div></>)}
          {contribuables && contribuables.length !==0 && (<><span style={{color:'green'}}> {contribuables.length} contribuables</span></>)}
          <table className="table  table-bordered mt-4">
        <thead>
          <tr className='table-warning'>
            <th>ID</th>
            <th>Code Client</th>
            <th>Noms et Prénoms</th>
            <th>NIU</th>
            <th> Statut</th>
            <th>Monant payé</th>
            <th>Reste à payer</th>
            <th>Numéro Tel</th>
            <th>CDI</th>
            <th>Localisation</th>
            <th>Distributeur</th>
            <th>CGA Actuel</th>
            <th>Ancien CGA</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contribuables.map((contribuable, index) => {
           /*  const isNewContribuable = !nouvelles.some(
              (nouvelle) => nouvelle.raison_sociale.includes(contribuable.nomPrenoms)
            ); */
            let rowClass =
            contribuable.statut === "ancien"
              ? parseInt(contribuable.paiement) === 50000 ? 'blanc':
               parseInt(contribuable.paiement) === 0 ? 'table-danger' :
                50000 - parseInt(contribuable.paiement) > 0 ? 'table-warning'
                : "table-success"
              : contribuable.statut === "nouveau" &&  parseInt(contribuable.paiement) === 0 
              ? 'table-danger'
              : contribuable.statut === "nouveau" &&  75000 - parseInt(contribuable.paiement) > 0
              ? 'table-warning'
              : contribuable.statut === "nouveau" &&    parseInt(contribuable.paiement) === 75000 ? ""
              : 'blanc';
        return (
          <>
            <tr key={contribuable.id}   >
              <td className={rowClass}  style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{index+1 }</td>
              <td  className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.codeClient}</td>
              <td className={rowClass}  style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.raison_sociale}</td>
              <td className={rowClass}  style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} >{contribuable.niu}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.statut}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} > {contribuable.paiement}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} >{contribuable.statut === "ancien" ? 50000 - parseInt(contribuable.paiement) : 75000 - contribuable.paiement}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} >{contribuable.tel}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} >{contribuable.codeunitegestion}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.localisation}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.distributeur}</td>
              <td className={rowClass} style={contribuable.statut === "ancien" && contribuable.ancienCga === "LA VOIX DU BARMAN" ? {backgroundColor:'#dee2e6'}:{backgroundColor:'rgb(34 182 255)'}} >{contribuable.cga}</td>
              <td className={rowClass} style={contribuable.statut === "ancien" && contribuable.ancienCga === "LA VOIX DU BARMAN" ? {backgroundColor:'#dee2e6'}:{backgroundColor:'rgb(34 182 255)'}} >{contribuable.ancienCga}</td>
              <td style= {{ cursor:'pointer'}} onClick={()=>{setShowModal(index)}}>Mofidier</td>
            </tr>
            {userInf && userInf.role === 'administrateur' && (
            <>
            <div className={`modal`} tabIndex="-1" role="dialog" style={{display:showModal === index ? "block":"none"}}>
            <div className="modal-dialog" role="document">
              <div className="modal-content container mt-0" style={ {wdth:`${largeurEcran-35}px`}}>
                <div className="modal-header">
                  <h5 className="modal-title">Mettez à jour</h5>
                  <button type="button" className="close" onClick={() => setShowModal(-1)} aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body row overflow-auto">
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
      </>
      )}
    </div>
  );
};

export default ListContrib;
