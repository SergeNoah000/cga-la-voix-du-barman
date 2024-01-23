
import React, { useState,  } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';

const DeleteForm = (data) => {
  const [message, setMessage] = useState('');
  const [messagerr, setMessager] = useState('');
  const [pending, setPending] = useState(0); 
  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  const navagateTo = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
  
      formData.append('id', data.data.id);
      formData.append("api/contrib-delete", "something");
      setPending(1);
      await axios.post(`https://cga.legionweb.co/cga-server.php`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((res) => {
        setPending(0);
        setMessage(res.data.message);
        const id = setTimeout(() => {
          setMessager('');
          navagateTo('/');
        }, 4000);
  
        const cancel = () => {
          clearTimeout(id);
        };
  
        setTimeout(cancel, 5000);
      })
      .catch((error) => {
       
        console.log(error);
        if (error.message && error.message === "Network Error") {
          const data1 = [{
            id: data.data.id,
          }];
  
          const after =  JSON.parse(localStorage.getItem('deleteFormData'));
          if (after) {
            after.push(...data1);
            localStorage.setItem('deleteFormData', JSON.stringify(after));
          } else {
            localStorage.setItem('deleteFormData', JSON.stringify(data1));
          }
          setPending(0);
          setMessager('');
          setMessage("Stocké en local en attente d'une connexion internet.");
          
  
          const id = setTimeout(() => {
            setMessage('');
            navagateTo('/');
          }, 4000);
  
          const cancel = () => {
            clearTimeout(id);
          };
  
          setTimeout(cancel, 5000);
        } else {
          setMessager(error.message);
          const id = setTimeout(() => {
            setMessager('');
          }, 4000);
  
          const cancel = () => {
            clearTimeout(id);
          };
  
          setTimeout(cancel, 5000);
        }
      });
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire :', error.message);
    }
  };

  return (
    <div className="container row col-12">
      
      <>
        <div className='row'>
            <h3 style={{color:"mediumvioletred"}}>Voulez-vous vraiment supprimer le contribuable ?</h3>


        </div>
        <div>
            <span>Nom/Raison Sociale:</span><br/>
            <p> {data.data.raison_sociale}</p>

            <span>NIU:</span><br/>
            <p> {data.data.niu}</p>


            <span>Numéro Client:</span><br/>
            <p> {data.data.codeClient}</p>
        </div>

          {message && (<h4 style={{ color: 'green' }}>{message}</h4>)}
          {messagerr && (<h4 style={{ color: 'red' }}>{messagerr}</h4>)}
        <div>
            <button className='btn btn-danger' disabled={pending===1} onClick={(e)=>{handleSubmit(e)}}>{pending === 1 && <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            /> }Je supprime</button>
        </div>

      </>
    </div>
  );
};

export default DeleteForm;
