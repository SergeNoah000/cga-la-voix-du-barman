import React , { useState, } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import encryptTextWithKey from '../utils/store';
import ENCRYPTION_KEY from '../key.js';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const navagateTo = useNavigate();

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Encrypt the password before sending it to the server
      const encryptedPassword = encryptTextWithKey(password, ENCRYPTION_KEY.ENCRYPTION_KEY);
      const form = new FormData();
      form.append("api/login", "ttest");
      form.append("username", username);
      form.append("password", encryptedPassword);
      
      // Make a request to the server to authenticate the user at http://${domainName}:8080/api/login
      await axios.post(`https://cga.legionweb.co/cga-server.php`, form)
      .then((res)=>{
        setStatus(res.data.msg)
        if (res.status === 202) {
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
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(res.data.user), ENCRYPTION_KEY.ENCRYPTION_KEY).toString();
        sessionStorage.setItem('userInfo', encryptedData);
        localStorage.setItem('userInfo', encryptedData);
        navagateTo('/');
      }})
      .catch((err)=>{
        console.log(err);
        setStatus(err.message);
        const id = setTimeout(() => {
          setStatus('');
        }, 4000);
      
        // Définir une fonction de rappel pour annuler la temporisation
        const cancel = () => {
          clearTimeout(id);
        };
      
        // Annuler la temporisation après 5 secondes
        setTimeout(cancel, 5000);
      })

    } catch (error) {
      // Handle login failure
      console.error('Login error', error.message);
    }
  };


  return (
    <section className="h-100 mt-4">
      <div className="container h-100">
        <div className="row justify-content-sm-center h-100">
          <div className="col-xxl-4 col-xl-5 col-lg-5 col-md-7 col-sm-9">
            
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <h1 className="fs-4 card-title fw-bold mb-4">Connexion</h1>
                <form onSubmit={(e)=>{handleLogin(e)}} className="needs-validation" noValidate autoComplete="off">
                  <div className="mb-3">
                  <div className="text-center my-5">
                    <img src="/log512.png" alt="logo" width="100%" />
                  </div>
                    <label className="mb-2 text-muted" htmlFor="email">
                      Nom d'utilisateur:
                    </label>
                    <input id="email" type="email" className="form-control" name="email" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
                    <div className="invalid-feedback">Email is invalid</div>
                  </div>

                  <div className="mb-3">
                    <div className="mb-2 w-100">
                      <label className="text-muted" htmlFor="password">
                        Mot de passe:
                      </label>
                      <Link to="/forgot-password" className="float-end">
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <input id="password" type="password" className="form-control" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <div className="invalid-feedback">Password is required</div>
                  </div>

                  <div className="">
                    <button style={{position:"relative", left:"30%"}} type="submit" className="btn btn-primary ms-auto">
                      Connexion
                    </button>
                  </div>
                  <br/>
                  {status && (
                  <div className="mb-3 align-items-center">
                    <h4 style ={{color:'red'}}> {status}</h4>
                  </div>
                  )}
                </form>

                <div className="text-center mt-5 mb-4 text-muted">
                  Copyright &copy; 2017-2023 &mdash; CGA La Voix du Barman
                </div>
              </div>
             {/*  <div className="card-footer py-3 border-0">
                <div className="text-center">
                  Don't have an account? <a href="register.html" className="text-dark">Create One</a>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
