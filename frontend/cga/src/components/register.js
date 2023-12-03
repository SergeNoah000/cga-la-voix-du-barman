import React from 'react';
import encryptTextWithKey from '../utils/store';
import ENCRYPTION_KEY from '../key.js';
import axios from 'axios';

const Register= () => {
  const [formData, setFormData] = React.useState({
    name: '',
    cpassword: '',
    password: '',
  });
  const [messageerr, setMessageerr] = React.useState('');
  const [status, setStatus] = React.useState('');


  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');


  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const { name, cpassword, password } = formData;
    

    if (name === '' || (cpassword !== password) || password === '') {
      setMessageerr("Les mot de passes doivent correspondre !")
      return;
    }
    try {

      setMessageerr('');
      setStatus('');
      // Encrypt the password before sending it to the server
      const encryptedPassword = encryptTextWithKey(password, ENCRYPTION_KEY.ENCRYPTION_KEY);

      // Make a request to the server to authenticate the user
       await axios.post(`http://${domainName}:8080/api/user-register`, { username:name, password: encryptedPassword })
      .then((res)=>{
        console.log(res.data);
        setStatus(res.data.msg)
      })
      .catch((err)=>{
        console.log(err);
        setMessageerr(err.message)
      })

    } catch (error) {
      // Handle login failure
      console.error('Login error', error.message);
    }

    console.log('Form submitted:', formData);
  };

  return (
    <div className="card shadow-lg">
      <div className="card-body p-5">
        <form method="POST" className="needs-validation" novalidate="" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="name">Nom d'utilisateur</label>
            <input
              id="name"
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autofocus
            />
            <div className="invalid-feedback">
              Le nom d'utilisateur est  requis
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="cpassword">Mot de passe </label>
            <input
            name='cpassword'
            id='cpassword'
              type="password"
              className="form-control"
              value={formData.cpassword}
              onChange={handleChange}
              required
            />
            <div className="invalid-feedback">
              Le mot de passe est oblige
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-2 text-muted" htmlFor="password">Confirmer mot de passe</label>
            <input
              id="password"
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className="invalid-feedback">
              Les mots de passe ne correspondent pas
            </div>
          </div>


          <div className="align-items-center">
            {messageerr && (<span style={{color:'red'}}>{messageerr}</span>)}<br/>
            {status && (<span style={{color:'freen'}}>{status}</span>)} <br/>
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
