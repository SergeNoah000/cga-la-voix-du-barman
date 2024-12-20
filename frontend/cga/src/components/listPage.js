import React, { useState } from 'react';
import axios from 'axios';

const ListPage = () => {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('mise-a-jour-en-ligne', true)
      formData.append('file', file);

      await axios.post('https://cga.legionweb.co/cga-server.php', formData, {
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
      <div className="modal-body row">
              {/* Champ de fichier XLS */}
              {message && (<><h4 style={{color:"green" }}>{message}</h4></>) }
              <input  accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' type="file" onChange={handleFileChange} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={()=>{handleUpload()}}>Envoyer</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Fermer</button>
            </div>

      {/* Modal */}
      <div className={`modal`} tabIndex="-2" role="dialog" style={{display:showModal? "block":"none"}}>
        <div className="modal-dialog" role="document">
          <div className="modal-content container mt-5" style={{position:'absolute', width:'350px'}}>
            <div className="modal-header">
              <h5 className="modal-title">Choisissez le fichier xlsx à jour</h5>
              <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body row">
              {/* Champ de fichier XLS */}
              {message && (<><h4 style={{color:"green" }}>{message}</h4></>) }
              <input type="file" accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'  onChange={handleFileChange} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={()=>{handleUpload()}}>Uploader</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPage;
