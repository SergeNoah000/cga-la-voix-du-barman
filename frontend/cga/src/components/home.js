

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './../key'
import UserRegister from './user-register';
import MultipleNavTables from './test';
import RenewForm from './renew-contribs';
import UpdateForm from './contrib-update';

const HomePage = () => {
  const [searchName, setSearchName] = useState('');
  const [contribuables, setContribuables] = useState([]);
  const [nouvelles, setNouvelles] = useState([]);
  const [userInf, setUserInf] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [showModal, setShowModal] = useState(-1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statut, setStatut] = useState('');
  const [message, setMessage] = useState('');
  const [messagerr, setMessager] = useState('');


  const navigateTo = useNavigate();
  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');
  const largeurEcran = window.innerWidth;

  const style = {
    color: '#737373', // Couleur de police gris clair
  };



/*   const handleSearch = () => {
  const filteredByName = contribuables.filter((contribuable) =>
    contribuable.raison_sociale.toLowerCase().includes(searchName.toLowerCase())
  );

  const filteredByOrigin = selectedOrigin
    ? contribuables.filter((contribuable) => contribuable.localisation === selectedOrigin)
    : contribuables;

  const filteredContribuables = [...new Set([...filteredByName, ...filteredByOrigin])];
  setContribuables(filteredContribuables);
};


  const handleReset = () => {
    setSearchName('');
    setSelectedOrigin('');
    setContribuables(contribuables);
  }; */

  function getUserInfos(){
    try {
        const encryptedData = sessionStorage.getItem('userInfo');
        const encryptedData1 = sessionStorage.getItem('userInfo');
        if (encryptedData) {
            const decryptedData = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
            if (decryptedData) {
            const userInfo = JSON.parse(decryptedData);
            setUserInf(userInfo)
            
            }
        }else{
            navigateTo('/login');
        }
      }catch(err){
            
    }
}
  const fetchContribuables = async () => {
    try {
      setLoading(true);//${domainName}:8080/
      const formulaire = new FormData();
      formulaire.append("api/contribuables", "something");
      formulaire.append("page" , currentPage);
      const response = await axios.post(`https://cga.legionweb.co/cga-server.php`, formulaire, {headres:{"Content-Type":"multipart/form-data"}});
      setContribuables((prevContribuables) => [...prevContribuables, ...response.data]);
      setCurrentPage(currentPage + 1);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des contribuables :', error.message);
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;

    if (scrollTop + windowHeight >= documentHeight - 400 && !loading) {
     // fetchContribuables();
    }
  };


  const synchronization=()=>{
    const formRegister = async () => {
      try {
          // Recuperer les données du formulaire dans le localStorage
          const after =  JSON.parse(localStorage.getItem('formData'));
          if(after){
            after.map(async(contrib, index)=>{
              const formData = new FormData();
        
              formData.append('codeClient', contrib.codeClient);
              formData.append('raison_sociale', contrib.nomPrenoms);
              formData.append('niu', contrib.niu);
              formData.append('statut', contrib.statut);
              formData.append('paiement', contrib.paiement);
              formData.append('tel', contrib.tel);
              formData.append('codeunitegestion', contrib.cdi);
              formData.append('localisation', contrib.localisation);
              formData.append('distributeur', contrib.distributeur);
              formData.append('cga', contrib.cga);
              formData.append('ancienCga', contrib.ancienCga);
              formData.append('userId', contrib.userId);
              formData.append("api/contrib-register", "something");

              await axios.post(`https://cga-legionweb.cocga-server.php`, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                })
                .then((res) => {
                  setMessage(res.data.msg + index + 1);
                  const id = setTimeout(() => {
                    setMessage('');
                  }, 4000);
                  const cancel = () => {
                    clearTimeout(id);
                  };
                  setTimeout(cancel, 3000);
                })
                .catch((error)=>{
                  console.log(error);
                })
            })
          localStorage.removeItem('formData');
        }
      }
      catch (error) {
        // Gestion des erreurs (affichage, journalisation, etc.)
        console.error('Erreur lors de la soumission du formulaire :', error.message);
      }
    };

    const formUpdate = async () => {
      try {
          const after =  JSON.parse(localStorage.getItem('updateFormData'));
          if (after) {
            after.map(async(contrib, index)=>{
              const formData = new FormData();
  
            formData.append('id',contrib.id);
            formData.append('raison_sociale', contrib.raison_sociale);
            formData.append('siglecga', contrib.siglecga);
            formData.append('activite_principale', contrib.activite_principale);
            formData.append('niu', contrib.niu);
            formData.append('tel', contrib.tel);
            formData.append('email', contrib.email);
            formData.append('coderegime', contrib.coderegime);
            formData.append('sigle', contrib.sigle);
            formData.append('cga', contrib.cga);
            formData.append('unite_gestion', contrib.unite_gestion);
            formData.append('statut', contrib.statut);
            formData.append('distributeur', contrib.distributeur);
            formData.append('ancienCga', contrib.ancienCga);
            formData.append('paiement', contrib.paiement);
            formData.append('codeClient', contrib.codeClient);
            formData.append('creation_date', contrib.creation_date);
            formData.append('update_date', null);
            formData.append("api/contrib-update", "something");
        
            await axios.post(`https://cga-legionweb.cocga-server.php`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
            .then((res) => {
              setMessage(res.data.message + index+1);
              const id = setTimeout(() => {
                setMessage('');
              }, 4000);
              const cancel = () => {
                clearTimeout(id);
              };
              setTimeout(cancel, 5000);
            })
            .catch((error) => {
              console.log(error);})
            });
            localStorage.removeItem("updateFormData");
          } ;
      } catch (error) {
        console.error('Erreur lors de la soumission du formulaire de mise à jour d\'un contribuable :', error.message);
      }
    };

    const formDelete = async () => {
      try {

          const after =  JSON.parse(localStorage.getItem('deleteFormData'));
          if (after) {
            after.map( async (contrib, index)=>{
              const formData = new FormData();
          
              formData.append('id',contrib.id);
              formData.append("api/contrib-delete", "something");
              await axios.post(`https://cga.legionweb.co/cga-server.php`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              })
              .then((res) => {
                setMessage(res.data.message + index+ 1);
                const id = setTimeout(() => {
                  setMessage('');
                }, 4000);
                const cancel = () => {
                  clearTimeout(id);
                };
                setTimeout(cancel, 5000);
              })
              .catch((error) => {
                console.log(error);
            })
            });

            localStorage.removeItem("deleteFormData");
          }
           
      } catch (error) {
        console.error('Erreur lors de la soumission du formulaire :', error.message);
      }
    };


  const formUserDelete = async () => {
    try {

        const after =  JSON.parse(localStorage.getItem('user-delete'));
        if (after) {
          after.map( async (contrib, index)=>{
            const formData = new FormData();
        
            formData.append('id',contrib.id);
            formData.append("api/contrib-delete", "something");
            await axios.post(`https://cga.legionweb.co/cga-server.php`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
            .then((res) => {
              setMessage(res.data.message + index+ 1);
              const id = setTimeout(() => {
                setMessage('');
              }, 4000);
              const cancel = () => {
                clearTimeout(id);
              };
              setTimeout(cancel, 5000);
            })
            .catch((error) => {
              console.log(error);
          })
          });

          localStorage.removeItem("user-delete")
        }
         
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire :', error.message);
    }
  };

  const formUserRegister = async () => {


    try {
          // Stoker les données du formulaire dans le localStorage
          const after =  JSON.parse(localStorage.getItem('user-register'));
          if(after){
            after.map( async (user, index)=>{
              setMessager('');
            setStatut('');
            const formulaire = new FormData();
            formulaire.append("username", user.name);
            formulaire.append("fullname", user.fullname);
            formulaire.append("role", user.role);
            formulaire.append("password", user.password);
            formulaire.append("api/user-register", "something");

            // Make a request to the server to authenticate the user  ://${domainName}:8080/api/user-register
            await axios.post(`https://cga.legionweb.co/cga-server.php`, formulaire, {headers:{"Content-Type":"multipart/form-data"}})
              .then((res) => {
                setStatut(res.data.msg+index+1);
              })
              .catch((error) => {
                console.log(error);});
            })
            localStorage.removeItem("user-register");
        }

    } catch (error) {
      // Handle login failure
      console.error('registration error', error.message);
    }
  };

  formRegister();
  formUpdate();
  formDelete();
  formUserRegister();
  formUserDelete();


  setMessage("Synchronisation terminée.")
  const id = setTimeout(() => {
    setMessage('');
  }, 4000);

  const cancel = () => {
    clearTimeout(id);
  };
  setTimeout(cancel, 5000);

};


    useEffect(() => {
      //fetchContribuables();
     /*  if (!loading) {
        synchronization();
        setLoading(true);
      } */
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, currentPage]);

  useEffect(() => {
    if (userInf.length === 0) {
      getUserInfos();
    }
  }, []);


  return (
  <div className="container mt-5">
 
 {message && (<h4 style={{ color: 'green' }}>{message}</h4>)}
          {statut && (<h4 style={{ color: "mediumvioletred" }}>{statut}</h4>)}
  {messagerr && (<><div style={{color:'red'}}><h3>{messagerr}</h3></div></>)}
    <MultipleNavTables/><br/>
           
  <button className="btn btn-warning me-2" onClick={(e)=>{
    sessionStorage.removeItem('userInfo');
    navigateTo('/login');
  }}>Deconnexion</button> 
  
  <div className="container-fluid">
      <div className="row">
        <div className="col">
          <p className="text-center mt-5 mb-3" style={style}>
            SIEGE SOCIAL: Yaoundé-carrefour Biyem-Assi en face du distributeur PEMIAF <br />
            Tel: 699 42 56 97 / 651 92 96 97 <br />
            Email: lavoixdubarman@gmail.com
          </p>
        </div>
      </div>
    </div>

      {/* <table className="table  table-bordered mt-4">
        <thead>
          <tr>
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
              <td className={rowClass}  style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}}>{index+1 }</td>
              <td  className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}}>{contribuable.codeClient}</td>
              <td className={rowClass}  style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}}>{contribuable.raison_sociale}</td>
              <td className={rowClass}  style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}} >{contribuable.niu}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}}>{contribuable.statut}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}} > {contribuable.paiement}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}} >{contribuable.statut === "ancien" ? 50000 - parseInt(contribuable.paiement) : 75000 - contribuable.paiement}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}} >{contribuable.tel}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}} >{contribuable.codeunitegestion}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}}>{contribuable.localisation}</td>
              <td className={rowClass} style={{ backgroundColor: rowClass === "table-danger" ? "#e53043" : "table-warning" ? rowClass === "table-warning" ? "rgb(249 234 35 / 88%)" : rowClass === "blanc" ? "#f3fbfb": "#dee2e6":"#dee2e6"}}>{contribuable.distributeur}</td>
              <td className={rowClass} style={contribuable.statut === "ancien" && contribuable.ancienCga === "LA VOIX DU BARMAN" ? {backgroundColor:'#dee2e6'}:{backgroundColor:'rgb(34 182 255)'}} >{contribuable.cga}</td>
              <td className={rowClass} style={contribuable.statut === "ancien" && contribuable.ancienCga === "LA VOIX DU BARMAN" ? {backgroundColor:'#dee2e6'}:{backgroundColor:'rgb(34 182 255)'}} >{contribuable.ancienCga}</td>
              <td style= {{ cursor:'pointer'}} onClick={()=>{setShowModal(index)}}>Mofidier</td>
            </tr>
            {userInf && userInf.role === 'administrateur' && (
            <>
            <div className={`modal`} tabIndex="-1" role="dialog" style={{display:showModal === index ? "block":"none"}}>
            <div className="modal-dialog" role="document">
              <div className="modal-content container mt-0" style={ {wdth:`${largeurEcran-35}px`}}>
                <div className="modal-header">
                  <h5 className="modal-title">Mettez à jour</h5>
                  <button type="button" className="close" onClick={() => setShowModal(-1)} aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body row overflow-auto">
               
                  {<UpdateForm data={contribuable} />}
                </div>
              </div>
            </div>
          </div>
          </>)}
          </>
          )})}
        </tbody>
      </table> */}
    </div>
  );
};

export default HomePage;
