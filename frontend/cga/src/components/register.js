import React, { useState } from 'react';
import encryptTextWithKey from '../utils/store';
import ENCRYPTION_KEY from '../key.js';
import axios from 'axios';
import { Button, Spinner } from 'react-bootstrap';

const Register = () => {

  const [name, setName] = useState('');
  const [fullname, setFullname] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [messageerr, setMessageerr] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [check, setCheck] = useState(false)


  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');

  const handleSubmit = async (event) => {
    event.preventDefault();


    if (name === '' || (cpassword !== password) || password === '') {
      setMessageerr("Les mots de passe doivent correspondre !");
      return;
    } else if (fullname.trim() === "") {
      setMessageerr("Entrez le nom d'utilisateur !");
      return;
    }
    try {

      setMessageerr('');
      setStatus('');
      setLoading(true);
      // Encrypt the password before sending it to the server
      const encryptedPassword = encryptTextWithKey(password, ENCRYPTION_KEY.ENCRYPTION_KEY);
      const formulaire = new FormData();
      formulaire.append("username", name);
      formulaire.append("fullname", fullname);
      formulaire.append("role", role);
      formulaire.append("password", encryptedPassword);
      formulaire.append("api/user-register", "something");

      // Make a request to the server to authenticate the user  ://${domainName}:8080/api/user-register
      await axios.post(`https://cga.legionweb.co/cga-server.php`, formulaire, {headers:{"Content-Type":"multipart/form-data"}})
        .then((res) => {
          setLoading(false);
          setStatus(res.data.msg);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          if (error.message && error.message === "Network Error") {
            const data = [{
              name:name,
              fullname:fullname,
              role:role,
              password:encryptedPassword,
            },];
      
              // Stoker les données du formulaire dans le localStorage
              const after =  JSON.parse(localStorage.getItem('user-register'));
              if(after){
                after.push(...data);
              localStorage.setItem('user-register', JSON.stringify(after));
            }else{
              localStorage.setItem('user-register', JSON.stringify(data));
            }
              setMessageerr('');
      
              setStatus(" Stocker en local en attente d'une connexion internet. ");
              const id = setTimeout(() => {
                setStatus('');
              }, 4000);
      
              // Définir une fonction de rappel pour annuler la temporisation
              const cancel = () => {
                clearTimeout(id);
              };
      
              // Annuler la temporisation après 5 secondes
              setTimeout(cancel, 5000);
          }else{
          setMessageerr(error.message);
          const id = setTimeout(() => {
            setMessageerr('');
          }, 4000);
    
          // Définir une fonction de rappel pour annuler la temporisation
          const cancel = () => {
            clearTimeout(id);
          };
    
          // Annuler la temporisation après 5 secondes
          setTimeout(cancel, 5000);
        }});

    } catch (error) {
      // Handle login failure
      console.error('registration error', error.message);
    }
  };

  return (
    <div className="card shadow-lg">
      <div className="card-body p-4">
        <form method="POST" className="needs-validation" noValidate onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="fullname">Nom complet</label>
            <input
              type="text"
              className="form-control"
              name="fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              autoFocus
            />
            <div className="invalid-feedback">
              Le nom est requis !
            </div>
          </div>
          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="name">Nom d'utilisateur</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="invalid-feedback">
              Le nom d'utilisateur est requis.
            </div>
          </div>

          <div className="mb-3">
              <label className="form-label">Rôle</label>
              <select className="form-select" name="statut" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required >
                <option value="">------------</option>
                <option value="simple"> Simple utilisateur </option>
                <option value="secretaire"> Secretaire </option>
                <option value="admin"> Administrateur  General</option>
              </select>
            </div>

          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="cpassword">Mot de passe </label>
            <input
              name='cpassword'
              type={check ? "text" : "password"}
              className={ password.length > 0 ? password.length < 8 ? "form-control is-invalid" : "form-control is-valid" : "form-control" }
              
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
              type={check ? "text" :"password"}
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

            <div className="ml-3 mb-4 mt-2">
                    <div className="form-check">
                      <input onChange={()=>setCheck(!check)} type="checkbox" name="remember" id="remember" className="form-check-input" />
                      <label htmlFor="remember" className="form-check-label">
                       Afficher les mots de passe
                      </label>
                    </div>
                  </div>
          </div>


          <div className="align-items-center">
            {messageerr && (<span style={{ color: 'red' }}>{messageerr}</span>)}<br />
            {status && (<span style={{ color: 'green' }}>{status}</span>)} <br />
            <button  disabled={loading} type="submit" className="btn btn-primary ms-auto">
             {loading === true && (<Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />)}
              Enregistrer
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default Register;