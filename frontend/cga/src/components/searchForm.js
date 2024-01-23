import React, { useEffect, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import axios from 'axios';
import UpdateForm from './contrib-update';
import DeleteForm from './contrib-delete';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './../key'
import {  useNavigate } from 'react-router-dom';

const SearchForm = ({ onSearch }) => {
  const [niu, setNiu] = useState('');
  const [raisonSociale, setRaisonSociale] = useState('');
  const [pending, setPending] = useState(0);
  const [numeroTel, setNumeroTel] = useState('');
  const [contribuables, setContribuables] = useState([]);
  const [showModal, setShowModal] = useState(-1);
  const [showModal2, setShowModal2] = useState(-1);
  const [userInf, setUserInf] = useState([]);
  const [localisation, setLocalisation] = useState('');
  const [messagerr, setMessagerr]  = useState('');

  const navigateTo = useNavigate();

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  const largeurEcran = window.innerWidth;


  function getUserInfos(){
    try {
        const encryptedData = sessionStorage.getItem('userInfo');
        if (encryptedData) {
            const decryptedData = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
            if (decryptedData) {
            const userInfo = JSON.parse(decryptedData);
            setUserInf(userInfo)
            
            }
        }else{
            navigateTo('/login');
        }}catch(err){
            
    }
}
  const handleSubmit =async(e) => {
    e.preventDefault();
    setPending(1);
    const formDat  = new FormData();
    formDat.append("niu", niu);
    formDat.append("sigle", niu);
    formDat.append("localisation", localisation);
    formDat.append("api/search", "localisation");
    formDat.append("numeroTel", numeroTel);
    formDat.append("raisonSociale", raisonSociale);  //${domainName}:8080/api/search
      try {
        await axios.post(`https://cga.legionweb.co/cga-server.php`, formDat,  {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then((response)=>{
          setContribuables(response.data);
          setMessagerr(response.data.length === 0 ? "Pas de contribuables correspondant !": ``)
          setPending(0);
        }).catch((error)=>{
          if(error?.message === "Network Error"){
            // Récupérer les données stockées en localstorage en cas d'erreur de connexion
            const storedData = JSON.parse(localStorage.getItem('contribuablesData'));
            let searchResults = [];

            if (storedData) {
              searchResults = storedData.filter((contribuable) => {
                return (
                  (niu && contribuable.niu.toLowerCase().includes(niu.toLowerCase())) ||
                  (raisonSociale && contribuable.raison_sociale.toLowerCase().includes(raisonSociale.toLowerCase())) ||
                  (numeroTel && contribuable.tel.toLowerCase().includes(numeroTel.toLowerCase())) ||
                  ( localisation && contribuable.localisation.toLowerCase().includes(localisation.toLowerCase()))
                );
              });
            }

            // Continuer avec les résultats de recherche locale ou réseau
            if (searchResults.length > 0) {
              setContribuables(searchResults);
              setMessagerr('Données en local non synchronisées.');
              setPending(0);
            }else{
              setMessagerr('Pas de correspondances dans les données en local non synchronisées.');
              setContribuables([]);
             setPending(0);
            }
            
          }else{
            setMessagerr("Nous n'avons rien trouvé dans les données non synchronées en local.");
            setPending(0);
            return;
          }
        })
        
        // Appeler la fonction de recherche avec les résultats
      } catch (error) {
        console.error('Erreur lors de la recherche :', error.message);
        setMessagerr(error.message);
      }
    }

    useEffect(()=>{
      if (userInf.length === 0 ) {
        getUserInfos();
      }

      /* return ()=>{
        setContribuables([]);
      } */
    })

  return (
    <>
    <form className='mt-4 align-center' onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-4 mb-3">
          <div className="d-flex align-items-center">
            <label htmlFor="niu" className="form-label mr-2">NIU</label>
            <input
              type="text"
              className="form-control bg-gray"
              id="niu"
              value={niu}
              onChange={(e) => setNiu(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="d-flex align-items-center">
            <label htmlFor="Tel" className="form-label mr-2">Tel</label>
            <input
              type="text"
              className="form-control bg-gray"
              id="numeroTel"
              value={numeroTel}
              onChange={(e) => setNumeroTel(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="d-flex align-items-center">
            <label htmlFor="localisation" className="form-label mr-2">Lieu</label>
            <input
              type="text"
              className="form-control bg-gray"
              id="localisation"
              value={localisation}
              onChange={(e) => setLocalisation(e.target.value)}
            />
          </div>
        </div>

        <div className=" mb-3">
          <div className="d-flex align-items-center">
            <label htmlFor="raisonSociale" className="form-label mr-2">Nom/Raison Sociale</label>
            <input
              type="text"
              className="form-control bg-gray col-md-8"
              id="raisonSociale"
              value={raisonSociale}
              style={{height:"60px", fontSize:"40px"}}
              onChange={(e) => setRaisonSociale(e.target.value)}
            />
          </div>
        </div>
        {messagerr && messagerr.length> 0 && <h3 style={{color:"mediumvioletred"}}>{messagerr}</h3>}
      </div>
      <Button disabled={pending===1} type="submit" className="btn btn-warning float-end ">{pending ? <>
            chargement en cours <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
            <span className="visually-hidden">Chargement...</span>
          </> : "Afficher"}</Button>
    </form>
    
    <div>
    {contribuables.length > 0 && (
      <> 
          {contribuables && contribuables.length !==0 && (<><span style={{color:'green'}}> {contribuables.length} contribuables</span></>)}
          <table className="table  table-bordered mt-4">
        <thead>
          <tr className='table-warning'>
            <th>ID</th>
            <th>Code Client</th>
            <th>Noms et Prénoms</th>
            <th>NIU</th>
            <th> Statut</th>
            <th>Monant payé</th>
            <th>Reste à payer</th>
            <th>Numéro Tel</th>
            <th>CDI</th>
            <th>Localisation</th>
            <th>Distributeur</th>
            <th>CGA Actuel</th>
            <th>Ancien CGA</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contribuables.map((contribuable, index) => {
           /*  const isNewContribuable = !nouvelles.some(
              (nouvelle) => nouvelle.raison_sociale.includes(contribuable.nomPrenoms)
            ); */
            let rowClass =
            contribuable.statut === "ancien"
              ? parseInt(contribuable.paiement) === 50000 ? 'blanc':
               parseInt(contribuable.paiement) === 0 ? 'table-danger' :
                50000 - parseInt(contribuable.paiement) > 0 ? 'table-warning'
                : "table-success"
              : contribuable.statut === "nouveau" &&  parseInt(contribuable.paiement) === 0 
              ? 'table-danger'
              : contribuable.statut === "nouveau" &&  75000 - parseInt(contribuable.paiement) > 0
              ? 'table-warning'
              : contribuable.statut === "nouveau" &&    parseInt(contribuable.paiement) === 75000 ? ""
              : 'blanc';
        return (
          <>
            <tr key={contribuable.id}   >
              <td className={rowClass}  style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{index+1 }</td>
              <td  className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.codeClient}</td>
              <td className={rowClass}  style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.raison_sociale}</td>
              <td className={rowClass}  style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} >{contribuable.niu}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.statut}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} > {contribuable.paiement}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} >{contribuable.statut === "ancien" ? 50000 - parseInt(contribuable.paiement) : 75000 - contribuable.paiement}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} >{contribuable.tel}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}} >{contribuable.codeunitegestion}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.localisation}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb":/* blanc */ "#dee2e6":"#dee2e6"}}>{contribuable.distributeur}</td>
              <td className={rowClass} style={contribuable.statut === "ancien" && contribuable.ancienCga === "LA VOIX DU BARMAN" ? {backgroundColor:'#dee2e6'}:{backgroundColor:'rgb(34 182 255)'}} >{contribuable.cga}</td>
              <td className={rowClass} style={contribuable.statut === "ancien" && contribuable.ancienCga === "LA VOIX DU BARMAN" ? {backgroundColor:'#dee2e6'}:{backgroundColor:'rgb(34 182 255)'}} >{contribuable.ancienCga}</td>
              <td style= {{ cursor:'pointer'}} /*  */>
                                                                              <div class="btn-group dropleft">
                                                                                <button type="button" class="btn  dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                                                  Options
                                                                                </button>
                                                                                <div class="dropdown-menu">
                                                                                  <span /* onClick={()=>{setShowModal(index); setShowModal2(-1)}} */ data-toggle="modal" data-target={"#exampleModal_1"+ contribuable.id} class="dropdown-item " href="#">Editer</span>
                                                                                  <span /* onClick={()=>{setShowModal2(index); setShowModal(-1)}} */ data-toggle="modal" data-target={"#exampleModal"+ contribuable.id} class="dropdown-item text-danger" href="#">Supprimer</span>
                                                                                </div>
                                                                              </div>
                                                                              </td>
                                  </tr>
                                  {userInf && userInf.role === 'administrateur' && (
                                  <>
                                  <div className="modal fade" id={"exampleModal_1"+ contribuable.id} tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                  <div className="modal-dialog" role="document">
                                    <div className="modal-content container mt-0" style={ {wdth:`${largeurEcran-35}px`}}>
                                      <div className="modal-header">
                                        <h5 className="modal-title">Mettez à jour</h5>
                                        <button type="button" className="close btn" data-dismiss="modal" aria-label="Close">
                                          <span aria-hidden="true">&times;</span>
                                        </button>
                                      </div>
                                      <div className="modal-body row overflow-auto">
                                        {/* Champ de fichier XLS */}
                                        {<UpdateForm data={contribuable} />}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="modal fade" id={"exampleModal"+ contribuable.id} tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                                  <div className="modal-dialog" role="document">
                                    <div className="modal-content container mt-0" style={ {wdth:`${largeurEcran-35}px`}}>
                                      <div className="modal-header">
                                        <h5 className="modal-title">Confirmer la suppression</h5>
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                          <span aria-hidden="true">&times;</span>
                                        </button>
                                      </div>
                                      <div className="modal-body row overflow-auto">
                                        {/* Champ de fichier XLS */}
                                        {<DeleteForm data={contribuable} />}
                                      </div>
                                    </div>
                                  </div>
                                </div>


          </>)}
          </>
          )})}
        </tbody>
      </table>
      </>
      )}
    </div>
    </>
  );
};

export default SearchForm;
