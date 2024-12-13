import React, { useState } from 'react';
import encryptTextWithKey from '../utils/store';
import ENCRYPTION_KEY from '../key.js';
import axios from 'axios';
import {  Spinner } from 'react-bootstrap';

const UserDetails = (DataSend) => {
  const {user} = DataSend !== null ? DataSend : null;
  const [name, setName] = useState(user&& user.username? user.username : null);
  const [fullname, setFullname] = useState(user && user.fullname ? user.fullname : null);
  const [cpassword, setCpassword] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user && user.role ? user.role : null);
  const [messageerr, setMessageerr] = useState('');
  const [status, setStatus] = useState('');
  const [pending1, setPending1] = useState(false);
  const [pending2, setPending2] = useState(false);


  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if(!user){
      setMessageerr("Une erreur s'est produite !");
      const id = setTimeout(() => {
        setStatus('');
        setMessageerr('');
      }, 4000);
      const cancel = () => {
        clearTimeout(id);
      };
      setTimeout(cancel, 5000);
      return;
    }

    if (name === user.name && (cpassword !== password) && password === '' && role === user.role && fullname === user.fullname) {
      setMessageerr("Pas de changements fait.");
      const id = setTimeout(() => {
        setStatus('');
      }, 4000);
      const cancel = () => {
        clearTimeout(id);
      };
      setTimeout(cancel, 5000);
      return;
    } else if (fullname.trim() === "" && name.trim() !== '') {
      setMessageerr("Le nom de l'utilsateur ou le nom complet ne peut être null.");
      return;
    }else if(password.length !== 0  && (cpassword !== password || password.length < 8 )){
      setMessageerr("Verifiez les mots sont corrects et correspondent !");
      return ;
    }
    try {

      setMessageerr('');
      setStatus('');
      setPending1(true);
      // Encrypt the password before sending it to the server
      let encryptedPassword = '';
      if (password.length>0) {
        encryptedPassword = encryptTextWithKey(password, ENCRYPTION_KEY.ENCRYPTION_KEY);
      } else {
        encryptedPassword = user.password;
      }
      const formulaire = new FormData();
      formulaire.append("username", name);
      formulaire.append("fullname", fullname);
      formulaire.append("id", user.id);
      formulaire.append("role", role);
      formulaire.append("password", encryptedPassword);
      formulaire.append("api/users-manage", "something");

      // Make a request to the server to authenticate the user  ://${domainName}:8080/api/user-register
      await axios.post(`https://cga.legionweb.co/cga-server.php`, formulaire, {headers:{"Content-Type":"multipart/form-data"}})
        .then((res) => {
          setStatus(res.data.msg);
          setPending1(false);
        })
        .catch((error) => {
          console.log(error);
          setPending1(false);
          if (error.message && error.message === "Network Error") {
            const data = [{
              id:user.id,
              name:name,
              fullname:fullname,
              role:role,
              password:encryptedPassword,
            },];
      
              // Stoker les données du formulaire dans le localStorage
              const after =  JSON.parse(localStorage.getItem('user-manage'));
              if(after){
                after.push(...data);
              localStorage.setItem('user-manage', JSON.stringify(after));
            }else{
              localStorage.setItem('user-manage', JSON.stringify(data));
            }
              setMessageerr('');
      
              setStatus(" Modifications stockées en local en attente d'une connexion internet. ");
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
      console.error(' error', error.message);
    }
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    if (!user) {
      setMessageerr("Une erreur s'est produite !");
      const id = setTimeout(() => {
        setStatus('');
        setMessageerr('');
      }, 4000);
      const cancel = () => {
        clearTimeout(id);
      };
      setTimeout(cancel, 5000);
      return;
    }
  
    const ch = prompt("Confirmer la suppression de: " + user.fullname + " ? (Oui/Non)");
    if (ch?.toLowerCase() === "oui" || false) { // Utilisez toLowerCase() pour convertir la chaîne en minuscules
      try {
        setMessageerr('');
        setStatus('');
        setPending2(true);
        // Encrypt the password before sending it to the server
        const formulaire = new FormData();
        formulaire.append("id", user.id);
        formulaire.append("api/user-delete", "something");
  
        // Make a request to the server to authenticate the user ://${domainName}:8080/api/user-register
        const response = await axios.post(`https://cga.legionweb.co/cga-server.php`, formulaire, { headers: { "Content-Type": "multipart/form-data" } });
        setStatus(response.data.message);
        setPending2(false);
      } catch (error) {
        console.log(error);
        if (error.message && error.message === "Network Error") {
          const data = [{ id: user.id }];
  
          // Stoker les données du formulaire dans le localStorage
          const after = JSON.parse(localStorage.getItem('user-delete'));
          if (after) {
            after.push(...data);
            localStorage.setItem('user-delete', JSON.stringify(after));
          } else {
            localStorage.setItem('user-delete', JSON.stringify(data));
          }
          setPending2(false);
          setMessageerr('');
  
          setStatus(" Modification stockée en local en attente d'une connexion internet. ");
          const id = setTimeout(() => {
            setStatus('');
          }, 4000);
          const cancel = () => {
            clearTimeout(id);
          };
          setTimeout(cancel, 5000);
        } else {
          setMessageerr(error.message);
          const id = setTimeout(() => {
            setMessageerr('');
          }, 4000);
          const cancel = () => {
            clearTimeout(id);
          };
          setTimeout(cancel, 5000);
        }
      }
    } else {
      setStatus(" Opération annulée !");
      const id = setTimeout(() => {
        setStatus('');
      }, 4000);
      const cancel = () => {
        clearTimeout(id);
      };
      setTimeout(cancel, 5000);
      return;
    }
  };

  return (
    <div className="card shadow-lg">
      <div className="card-body  container  row col p-4">
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
                <option value="administrateur"> Administrateur  General</option>
              </select>
            </div>

          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="cpassword">Mot de passe </label>
            <input
              name='cpassword'
              type="password"
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
            <button type="submit" disabled={pending1} className="btn btn-primary ms-auto">
            {pending1 && <Spinner as="span" className="mr-2" animation="border" size="sm" role="status" aria-hidden="true" />}
              Mettre à jour
            </button>
            <button type="button" disabled={pending2}  onClick={handleDelete} className=" ml-2 mt-2 btn btn-danger ms-auto">
                  {pending2 && <Spinner as="span" className="mr-2" animation="border" size="sm" role="status" aria-hidden="true" />}
              Supprimer l'utilisateur
            </button>
            
          </div>
        </form>
      </div>

    </div>
  );
};

export default UserDetails;