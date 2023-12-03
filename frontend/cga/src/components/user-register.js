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

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post('http://localhost:8080/mise-a-jour-en-ligne', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((res)=>{
        setMessage(res.data.message);
        setFile(null)
      })
      .catch((err)=>{
        console.log(err);
      })

      // Ajoutez ici la logique pour actualiser la liste après la mise à jour

      setShowModal(false); // Fermez le modal après la mise à jour
    } catch (error) {
      console.error('Erreur lors de l\'envoi du fichier :', error);
    }
  };

  return (
    <div>
      {/* Bouton pour ouvrir le modal */}
  <span> Enregistré un nouveau utilisateur <Link to='#' onClick={() => setShowModal(true)}> sur cette page</Link></span>


      {/* Modal */}
      <div className={`modal`} tabIndex="-1" role="dialog" style={{display:showModal? "block":"none"}}>
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
