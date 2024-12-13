import React , { useState, } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import encryptTextWithKey from '../utils/store';
import ENCRYPTION_KEY from '../key.js';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import {Spinner} from 'react-bootstrap';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const [check, setCheck] = useState(false);

  const navagateTo = useNavigate();

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  
  const handleLogin = async (e) => {
    e.preventDefault();

    async function hashPassword(password) {
      // Convertir le mot de passe en bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
  
      // Calculer le hash SHA-256
      const hashBuffer = await crypto.subtle.digest('SHA-256', data); 
  
      // Convertir le hash en tableau d'octets
      const hashArray = Array.from(new Uint8Array(hashBuffer)); 
  
      // Convertir le tableau d'octets en chaîne hexadécimale
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
      return hashHex; // Retourner la chaîne de caractères du hash
  }

    try {
      // Encrypt the password before sending it to the server
      const encryptedPassword = await hashPassword(password);
      const form = new FormData();
      form.append("api/login", "ttest");
      form.append("username", username);
      form.append("password", encryptedPassword);
      setPending(true);
      // Make a request to the server to authenticate the user at http://${domainName}:8080/api/login
      await axios.post(`https://cga.legionweb.co/cga-server.php`, form)
      .then((res)=>{
        setStatus(res.data.msg);
        setPending(false);
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
        setPending(false);
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
                    <input id="password" type={check ? "text":"password"} className="form-control" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <div className="invalid-feedback">Password is required</div>
                  </div>
                  <div className="ml-3 mb-4">
                    <div className="form-check">
                      <input onChange={()=>setCheck(!check)} type="checkbox" name="remember" id="remember" className="form-check-input" />
                      <label htmlFor="remember" className="form-check-label">
                       Afficher le mot de passe
                      </label>
                    </div>
                  </div>

                  <div className="">
                    <button disabled={pending} style={{position:"relative", left:"30%"}} type="submit" className="btn btn-primary ms-auto">
                      {pending && <Spinner as="span" className="mr-2" animation="border" size="sm" role="status" aria-hidden="true" />}
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
