import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import UpdateForm from './contrib-update';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './../key';
import { useNavigate } from 'react-router-dom';

const ValidateContrib = () => {
  const [contribuables, setContribuables] = useState([]);
  const [messagerr, setMessagerr] = useState('');
  const [message, setMessage] = useState('');
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
      
      const response = await axios.get(`http://${domainName}:8080/api/contribuables/validate`);
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
      {contribuables.length === 0 && !loading && <p>Pas d'ajout recente à valider.</p>}
      {contribuables.length > 0 && (
      <>
          {message && (<><div style={{color:'green'}}><h3>{message}</h3></div></>)}
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
            <th>Localisation</th>
            <th>Ajouté Par</th>
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
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.localisation}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.username}</td>
              <td className={rowClass} style={contribuable.statut === "ancien" && contribuable.ancienCga === "LA VOIX DU BARMAN" ? {backgroundColor:'#dee2e6'}:{backgroundColor:'rgb(34 182 255)'}} >{contribuable.cga}</td>
              <td className={rowClass} style={contribuable.statut === "ancien" && contribuable.ancienCga === "LA VOIX DU BARMAN" ? {backgroundColor:'#dee2e6'}:{backgroundColor:'rgb(34 182 255)'}} >{contribuable.ancienCga}</td>
              <td className="d-flex " style= {{ cursor:'pointer'}} >
                <span title='Editer' onClick={()=>{setShowModal(index)}} className="btn btn-outline-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                    <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/>
                </svg>
                </span>
                <span  title='Valider' className="btn btn-outline-success ml-2" onClick={()=>{
                  console.log( {id:contribuable.id, valide: true})
                    axios.post(`http://${domainName}:8080/api/contrib/validate`, {id:contribuable.id, valide: true})
                    .then((res)=>{
                        setMessage(res.message);
                      console.log(res)
                        const id = setTimeout(() => {
                            setMessage('');
                          }, 4000);
                        
                          // Définir une fonction de rappel pour annuler la temporisation
                          const cancel = () => {
                            clearTimeout(id);
                          };
                        
                          // Annuler la temporisation après 5 secondes
                          setTimeout(cancel, 5000);
                    
                    })
                    .catch((err)=>{
                        setMessagerr("Nous avec rencontrer un problème.\n " + err.message);
                        console.log(err);
                        const id = setTimeout(() => {
                            setMessagerr('');
                          }, 4000);
                        
                          // Définir une fonction de rappel pour annuler la temporisation
                          const cancel = () => {
                            clearTimeout(id);
                          };
                        
                          // Annuler la temporisation après 5 secondes
                          setTimeout(cancel, 5000);
                    })
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2-circle" viewBox="0 0 16 16">
                    <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0"/>
                    <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z"/>
                </svg>
                </span>

                <span  title='Supprimer' className="btn btn-outline-danger ml-2" onClick={()=>{
                        axios.post(`http://${domainName}:8080/api/contrib/validate`, {id:contribuable.id, valide: false})
                        .then((res)=>{
                            setMessage(res.message);
                            const id = setTimeout(() => {
                                setMessage('');
                            }, 4000);
                            
                            // Définir une fonction de rappel pour annuler la temporisation
                            const cancel = () => {
                                clearTimeout(id);
                            };
                            
                            // Annuler la temporisation après 5 secondes
                            setTimeout(cancel, 5000);
                        
                        })
                        .catch((err)=>{
                            setMessagerr("Nous avec rencontrer un problème.\n " + err.message);
                            const id = setTimeout(() => {
                                setMessagerr('');
                            }, 4000);
                            
                            // Définir une fonction de rappel pour annuler la temporisation
                            const cancel = () => {
                                clearTimeout(id);
                            };
                            
                            // Annuler la temporisation après 5 secondes
                            setTimeout(cancel, 5000);
                        })
                    }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                    </svg>
                </span>
              </td>
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

export default ValidateContrib;
