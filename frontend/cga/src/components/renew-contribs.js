import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UpdateForm from './contrib-update';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './../key'
import { Link, useNavigate } from 'react-router-dom';

const RenewForm = () => {
  const [userInf, setUserInf] = useState([]);
  const [message, setMessage] = useState('');
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
  const handleSubmit =async(e) => {
    e.preventDefault();
    const rep = prompt('Confimiez que vous mettez le paiement de tout les contribuables à 0F: (Oui/Non)')
    if(rep === "OUI" || rep === "Oui" || rep === "oui"){
        
        // Vérifier que au moins un champ n'est pas vide
        try {
            const response = await axios.get(`http://${domainName}:8080/api/contribs/renew` );
            // Appeler la fonction de recherche avec les résultats
            setMessage(response.data.message);
            const id = setTimeout(() => {
                setMessage('');
            }, 6000);
            
            // Définir une fonction de rappel pour annuler la temporisation
            const cancel = () => {
                clearTimeout(id);
            };
            
            // Annuler la temporisation après 5 secondes
            setTimeout(cancel, 10000);
        } catch (error) {
            console.error('Erreur lors de la recherche :', error.message);
            setMessage(error.message);
            const id = setTimeout(() => {
                setMessage('');
            }, 6000);
            
            // Définir une fonction de rappel pour annuler la temporisation
            const cancel = () => {
                clearTimeout(id);
            };
            
            // Annuler la temporisation après 5 secondes
            setTimeout(cancel, 10000);
        }
    }else{
        return;
    }
}

    useEffect(()=>{
      if (userInf.length === 0 ) {
        getUserInfos();
      }
    })

  return (
    <>
    {message && (<>
        <h3 style={{color:message === "Mis à jour avec succès."?"green":"red"}}>
            {message}
        </h3>
    </>)}
    <form className='mt-4 align-center' onSubmit={handleSubmit}>
      <button type="submit" className="btn btn-danger float-end">Mettre tout le monde à 0F de paiement</button>
    </form>
    
    </>
  );
};

export default RenewForm;
