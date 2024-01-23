import React, { useEffect, useState } from 'react';
import encryptTextWithKey from '../utils/store';
import ENCRYPTION_KEY from '../key.js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const ReneWPassword = () => {

  const [oldPassword, setOldPassword] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [password, setPassword] = useState('');
  const [messageerr, setMessageerr] = useState('');
  const [status, setStatus] = useState('');
  const [oublier, setOublier] = useState(false);
  const [userInf, setUserInf] = useState([]);




  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  const navigateTo = useNavigate();


  function getUserInfos(){
    try {
        const encryptedData = localStorage.getItem('userInfo');
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
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (oldPassword.trim() ==="") {
        return;
    }
    if (oldPassword.length > 10 && oldPassword !== userInf?.password){
        setMessageerr("Une erreur s'est produite !");
        return;
    }else if((oublier ? oldPassword  !== userInf?.password : encryptTextWithKey(oldPassword, ENCRYPTION_KEY.ENCRYPTION_KEY) !== userInf?.password ) || (cpassword !== password) || password === '' || password.length<8) {
      setMessageerr("Ancien mot de passe incorrect ou trop petit!");
      return;
    }  
    try {

      setMessageerr('');
      setStatus('');
      // Encrypt the password before sending it to the server
      const encryptedPassword = encryptTextWithKey(password, ENCRYPTION_KEY.ENCRYPTION_KEY);
      const formulaire = new FormData();
      formulaire.append("password", encryptedPassword);
      formulaire.append("id", userInf.id);
      formulaire.append("api/user-update", "something");

      // Make a request to the server to authenticate the user ${domainName}:8080/api/user-update
      await axios.post(`https://cga.legionweb.co/cga-server.php`, formulaire, {headers:{
        "Content-Type":"multipart/form-data",
      }})
        .then((res) => {
          setStatus(res.data.msg);

          const id = setTimeout(() => {
            setStatus('');
            localStorage.removeItem('userInfo');
            Window.reload();
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
          setMessageerr(err.message);
        });

    } catch (error) {
      // Handle login failure
      console.error('Login error', error.message);
    }
  };


  const handleForgotPassword=(e)=>{
    e.preventDefault();
    if (userInf?.role === 'administrateur') {
        document.getElementById('resetPass').style.display = 'none';
        setOldPassword(userInf?.password);
        setOublier(true);
    } else {
        setStatus("Veuillez contater M. Ngongo l'administrateur pour qu'il le renouvelle.");
        alert("Veuillez contater M. Ngongo l'administrateur pour qu'il le renouvelle." );
        const id = setTimeout(() => {
            setStatus('');
          }, 10000);
        
          // Définir une fonction de rappel pour annuler la temporisation
          const cancel = () => {
            clearTimeout(id);
          };
        
          // Annuler la temporisation après 5 secondes
          setTimeout(cancel, 10000);

    }
  }
  useEffect(()=>{
    if (userInf.length===0) {
        getUserInfos();
    }
  })

  return (
    <div className="card shadow-lg">
      <div className="card-body p-4">
        <form method="POST" className="needs-validation" noValidate onSubmit={handleSubmit}>
          
          <div className="mb-3" id="resetPass">
            <label className="mb-2 text-muted" htmlFor="name">Ancien mot de passe</label>
            <input
              type="password"
              className={oldPassword.length > 0 ? encryptTextWithKey(oldPassword, ENCRYPTION_KEY.ENCRYPTION_KEY) === userInf?.password ? "form-control is-valid": " is-invalid form-control":"form-control"}
              name="name"
              onBlur={(e) => setOldPassword(e.target.value)}
              required
            />
            <div className="invalid-feedback">
              Ne correspond pas à l'ancien mot de passe ! 
            <a href='#' onClick={handleForgotPassword} className="float-end" >Mot de passe oublié ?</a>
            </div>
            <div className="valid-feedback">
            </div>
          </div>

          <div className="mb-3 ">
            <label className="mb-2 text-muted" htmlFor="cpassword">Nouveau mot de passe </label>
            <input
              name='cpassword'
              type="password"
              className={ password.length > 0 ? password.length < 8 ? "form-control is-invalid": "form-control is-valid": "form-control"}
              
              onBlur={(e) => setPassword(e.target.value)}
              required
            />
            <div className="invalid-feedback">
              Au moins 8 caractères pour un mot de passe !
            </div>
            <div className="valid-feedback">
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="password">Confirmer le mot de passe</label>
            <input
              type="password"
              className={ cpassword.length > 0 ? password === cpassword  ?"form-control is-valid": "form-control is-invalid": "form-control"}
              name="password"
              onBlur={(e) => setCpassword(e.target.value)}
              required
            />
            <div className="invalid-feedback">
              Les mots de passe ne correspondent pas.
            </div>
            <div className="valid-feedback">
            </div>
          </div>


          <div className="align-items-center">
            {messageerr && (<span style={{ color: 'red' }}>{messageerr}</span>)}<br />
            {status && (<span style={{ color: 'green' }}>{status}</span>)} <br />
            <button type="submit" className="btn btn-primary ms-auto">
              Enregistrer
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ReneWPassword;