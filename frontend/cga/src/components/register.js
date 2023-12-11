import React, { useState } from 'react';
import encryptTextWithKey from '../utils/store';
import ENCRYPTION_KEY from '../key.js';
import axios from 'axios';

const Register = () => {

  const [name, setName] = useState('');
  const [fullname, setFullname] = useState('');
  const [cpassword, setCpassword] = useState('');
  const [password, setPassword] = useState('');
  const [messageerr, setMessageerr] = useState('');
  const [status, setStatus] = useState('');


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
      // Encrypt the password before sending it to the server
      const encryptedPassword = encryptTextWithKey(password, ENCRYPTION_KEY.ENCRYPTION_KEY);

      // Make a request to the server to authenticate the user
      await axios.post(`http://${domainName}:8080/api/user-register`, { username: name, fullname: fullname, password: encryptedPassword })
        .then((res) => {
          console.log(res.data);
          setStatus(res.data.msg);
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

  return (
    <div className="card shadow-lg">
      <div className="card-body p-4">
        <form method="POST" className="needs-validation" noValidate onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="fullname">Nom complet</label>
            <input
              id="fullname"
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
              id="name"
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
            <label className="mb-2 text-muted" htmlFor="cpassword">Mot de passe </label>
            <input
              name='cpassword'
              id='cpassword'
              type="password"
              className="form-control"
              value={cpassword}
              onChange={(e) => setCpassword(e.target.value)}
              required
            />
            <div className="invalid-feedback">
              Le mot de passe est obligatoire.
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="password">Confirmer le mot de passe</label>
            <input
              id="password"
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="invalid-feedback">
              Les mots de passe ne correspondent pas.
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

export default Register;