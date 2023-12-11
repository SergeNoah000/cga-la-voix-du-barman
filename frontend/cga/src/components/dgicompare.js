import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './../key'
import {  Spinner } from 'react-bootstrap';
import {useNavigate} from 'react-router-dom'

const DgiCompare = () => {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [contribuables, setContribuables] = useState([]);
  const [userInf, setUserInf] = useState([]);
  const [messagerr, setMessagerr]  = useState('');
  const [message, setMessage]  = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Nouvel état pour la progression d'envoi

  const navigateTo = useNavigate();

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  const largeurEcran = window.innerWidth;


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

    useEffect(()=>{
      if (userInf.length === 0 ) {
        getUserInfos();
      }
    })

    const ecouteEvent = ()=>{
      const eventSource = new EventSource(`http://${domainName}:8080/api/dgi-compare`);

      eventSource.onmessage = (event) => {
        const progressPercentage = parseFloat(event.data);
        console.log(event)
      };

      eventSource.onerror = (error) => {
        console.error('Erreur de communication SSE :', error);
      };

      // Pour gérer la fin de la communication SSE
      eventSource.onclose = () => {
        console.log('La communication SSE est terminée.');
};

    }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(`http://${domainName}:8080/api/dgi-compare`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Écouter l'événement uploadProgress pour mettre à jour la progression
        onUploadProgress: progressEvent => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
          if (uploadProgress > 98  ) {
            ecouteEvent();

            setMessage("Envoye! \nAttendez le traitement");
          }
        },
      }).then((res)=>{
        console.log(res.data)
        setMessage(res.data.message);
        setLoading(false);
        setContribuables(res.data.contribuables);
        const id = setTimeout(() => {
          setMessage('');
        }, 4000);
      
        // Définir une fonction de rappel pour annuler la temporisation
        const cancel = () => {
          clearTimeout(id);
        };
      
        // Annuler la temporisation après 5 secondes
        setTimeout(cancel, 5000);
        setFile(null)
      })
      .catch((err)=>{
        console.log(err);
        setMessagerr(err.message);
        const id = setTimeout(() => {
          setMessagerr('');
        }, 10000);
      
        // Définir une fonction de rappel pour annuler la temporisation
        const cancel = () => {
          clearTimeout(id);
        };
      
        // Annuler la temporisation après 5 secondes
        setTimeout(cancel, 5000);
        setFile(null)
      })

      // Ajoutez ici la logique pour actualiser la liste après la mise à jour

      setShowModal(false); // Fermez le modal après la mise à jour
    } catch (error) {
      console.error('Erreur lors de l\'envoi du fichier :', error);
    }
  };

  return (
    <div>
      {/* Bouton pour ouvrir le modal */}
      <div className="modal-body row">
              {/* Champ de fichier XLS */}
              {message && (<><h4 style={{color:"green" }}>{message}</h4></>) }
              <input type="file" onChange={handleFileChange} />
            </div>
            <div className="modal-footer">
            {uploadProgress ===100 && (
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
        )}   
             {/* Barre de progression */}
              {uploadProgress > 0 && (
                <div className="progress" style={{marginTop: '10px', width:'250px'}}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{width: `${uploadProgress}%`}}
                    aria-valuenow={uploadProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {uploadProgress}%
                  </div>
                </div>
              )}
              <button type="button" className="btn btn-primary" onClick={()=>{handleUpload()}}>Envoyer</button>
            </div>

      
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
            <th>Numéro Tel</th>
            <th>CDI</th>
            <th>Localisation</th>
            <th>Distributeur</th>
            <th>CGA Actuel</th>
            <th>Ancien CGA</th>
          </tr>
        </thead>
        <tbody> 
          {contribuables.map((contribuable, index) => {
             const rowClass = contribuable.upToDate ? '' : "table-danger" /*'blurred-row'*/;
        return (
          <>
            <tr key={contribuable.id}  className = {rowClass} >
              <td className={rowClass}  >{index+1 }</td>
              <td  className={rowClass} >{contribuable.codeClient}</td>
              <td className={rowClass}  >{contribuable.raison_sociale}</td>
              <td className={rowClass}   >{contribuable.niu}</td>
              <td className={rowClass} >{contribuable.statut}</td>
              <td className={rowClass}  > {contribuable.paiement}</td>
              <td className={rowClass}  >{contribuable.tel}</td>
              <td className={rowClass}  >{contribuable.codeunitegestion}</td>
              <td className={rowClass} >{contribuable.localisation}</td>
              <td className={rowClass} >{contribuable.distributeur}</td>
              <td className={rowClass}  >{contribuable.cga}</td>
              <td className={rowClass}  >{contribuable.ancienCga}</td>
            </tr>
            
          </>
          )})}
        </tbody>
      </table>
      </>
      
    </div>
  );
};

export default DgiCompare;
