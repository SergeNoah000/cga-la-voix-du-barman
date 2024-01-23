import React, { useState } from 'react';
import axios from 'axios';
import Register from './register';
import { Link } from 'react-router-dom';

const UserRegister = () => {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };



  return (
    <div>
      {/* Bouton pour ouvrir le modal */}
  <span> Enregistré un nouveau utilisateur <Link to='#' onClick={() => setShowModal(true)}> sur cette page</Link></span>


      {/* Modal */}
      <div className="modal fade" id="userRegister" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content container mt-5" style={{position:'absolute', width:'350px'}}>
            <div className="modal-header">
              <h5 className="modal-title">Entrez ses informations</h5>
              <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body row">
              {/* Champ de fichier XLS */}
              {message && (<><h4 style={{color:"green" }}>{message}</h4></>) }
              <Register/>
            </div>
            <div className="modal-footer">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
