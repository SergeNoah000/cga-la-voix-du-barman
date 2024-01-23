import React, { useEffect, useState } from 'react';
import { Nav, NavItem, NavLink, TabContent, TabPane, Container, Row, Col } from 'reactstrap';
import RegistrationForm from './contrib-register';
import ListContrib from './listContrib';
import SearchForm from './searchForm';
import Register from './register';
import ListPage from './listPage';
import ValidateContrib from './validate';
import DgiCompare from './dgicompare';
import CryptoJS from 'crypto-js';
import ENCRYPTION_KEY from './../key'
import { useNavigate } from 'react-router-dom';
import RenewForm from './renew-contribs';
import ReneWPassword from './renew-password';
import axios from 'axios';
import UserManage from './user-manage';
import {  Spinner } from 'react-bootstrap';

const MultipleNavTables = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [userInf, setUserInf] = useState([]);
  const [pending2, setPending2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statut, setStatut] = useState('');
  const [message, setMessage] = useState('');
  const [messagerr, setMessager] = useState('');
  
  const navigateTo = useNavigate();

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  }

  useEffect( () => {

    const syncData = async () => {
      await synchronization();
    };
  
    syncData();
    if (userInf.length === 0) {
      getUserInfos();
    }
    
    
  }, [])

  const getUserInfos = () => {
    try {
      const encryptedData = sessionStorage.getItem('userInfo');
      if (encryptedData) {
        const decryptedData = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY.ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        if (decryptedData) {
          const userInfo = JSON.parse(decryptedData);
          setUserInf(userInfo);
        }
      } else {
        navigateTo('/login');
      }
    } catch (err) {}
  }


  const renewComtrib = async(e) => {
    e.preventDefault();
    const rep = prompt('Confimiez que vous mettez le paiement de tout les contribuables à 0F: (Oui/Non)')
    if(rep === "OUI" || rep === "Oui" || rep === "oui"){
        
        // Vérifier que au moins un champ n'est pas vide   ${domainName}:8080/api/contribs/renew
        const formulaire = new FormData();
        formulaire.append("api/contribs/renew", "something");
        try {
            const response = await axios.post(`https://cga.legionweb.co/cga-server.php`,  formulaire, {headers:{"Content-Type":"multipart/form-data"}} );
            // Appeler la fonction de recherche avec les résultats
            setMessage(response.data.message);
            const id = setTimeout(() => {
                setMessage('');
            }, 6000);
            
            // Définir une fonction de rappel pour annuler la temporisation
            const cancel = () => {
                clearTimeout(id);
            };
            
            // Annuler la temporisation après 5 secondes
            setTimeout(cancel, 10000);
        } catch (error) {
            console.error('Erreur lors de la mise à 0F :', error.message);
            setMessage(error.message);
            const id = setTimeout(() => {
                setMessage('');
            }, 6000);
            
            // Définir une fonction de rappel pour annuler la temporisation
            const cancel = () => {
                clearTimeout(id);
            };
            
            // Annuler la temporisation après 5 secondes
            setTimeout(cancel, 10000);
        }
    }else{
      setMessage("Opération annulée !");
      const id = setTimeout(() => {
          setMessage('');
      }, 6000);
      
      // Définir une fonction de rappel pour annuler la temporisation
      const cancel = () => {
          clearTimeout(id);
      };
      
      // Annuler la temporisation après 5 secondes
      setTimeout(cancel, 10000);
  return;
    }
}


const deleteAllConrib = async(e) => {
  e.preventDefault();
  const rep = prompt('Vous êtes sur le point de supprimer tous les contribuables de la base de données. Entrez-votre reponse: (Oui/Non)')
  if(rep === "OUI" || rep === "Oui" || rep === "oui"){
      
      // Vérifier que au moins un champ n'est pas vide   ${domainName}:8080/api/contribs/renew
      const formulaire = new FormData();
      formulaire.append("api/contribs/delete-all", "something");
      try {
          const response = await axios.post(`https://cga.legionweb.co/cga-server.php`,  formulaire, {headers:{"Content-Type":"multipart/form-data"}} );
          // Appeler la fonction de recherche avec les résultats
          setMessage(response.data.message);
          const id = setTimeout(() => {
              setMessage('');
          }, 6000);
          
          // Définir une fonction de rappel pour annuler la temporisation
          const cancel = () => {
              clearTimeout(id);
          };
          
          // Annuler la temporisation après 5 secondes
          setTimeout(cancel, 10000);
      } catch (error) {
          console.error('Erreur lors du vidage de la base données :', error.message);
          setMessage(error.message);
          const id = setTimeout(() => {
              setMessage('');
          }, 6000);
          
          // Définir une fonction de rappel pour annuler la temporisation
          const cancel = () => {
              clearTimeout(id);
          };
          
          // Annuler la temporisation après 5 secondes
          setTimeout(cancel, 10000);
      }
  }else{
    setMessage("Opération annulée !");
          const id = setTimeout(() => {
              setMessage('');
          }, 6000);
          
          // Définir une fonction de rappel pour annuler la temporisation
          const cancel = () => {
              clearTimeout(id);
          };
          
          // Annuler la temporisation après 5 secondes
          setTimeout(cancel, 10000);
      return;
  }
};


const handleExport = async () => {
  const formulaire = new FormData();
  formulaire.append("api/users/export-xlsx", "something");
  setPending2(true);
  try {
    const response = await axios.post(
      "https://cga.legionweb.co/cga-server.php",
      formulaire,
      {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob", // Spécifier le type de réponse comme blob
      }
    );

    const formatDate = (date) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
      return date.toLocaleDateString('fr-fr', options);
    };

    // Vérifier si la réponse est réussie
    if (response.status === 200) {
      // Récupérer le nom du fichier à partir des en-têtes de réponse
      const disposition = response.headers["content-disposition"];
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(disposition);
      const currentDate = new Date();
      const formattedDate = formatDate(currentDate);
      setPending2(false);
      const filename = matches && matches[1] ? matches[1].replace(/['"]/g, "") : "contribuables la-voix-barman "+  formattedDate +  '.xlsx';

      // Créer une URL object URL pour le blob de la réponse
      const blob = new Blob([response.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);

      // Créer un lien ancré pour télécharger le fichier
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Cliquez sur le lien ancré pour lancer le téléchargement
      link.click();

      // Libérer l'objet URL après le téléchargement
      URL.revokeObjectURL(url);
    } else {
      setPending2(false);
      throw new Error("La réponse du serveur n'est pas valide");     
    }
  } catch (error) {
    console.error('Erreur lors de l\'exportation de la base de données :', error);
      setPending2(false);
      setMessage(error.message);
    const id = setTimeout(() => {
      setMessage('');
    }, 6000);

    const cancel = () => {
      clearTimeout(id);
    };

    setTimeout(cancel, 10000);
  }
};

const synchronization = async ()=>{
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
          setMessage("Synchronisation terminée.")

          const id = setTimeout(() => {
            setMessage('');
          }, 4000);

          const cancel = () => {
            clearTimeout(id);
          };
          setTimeout(cancel, 5000);

      }

  } catch (error) {
    // Handle login failure
    console.error('registration error', error.message);
  }
};

    await formRegister();
    await formUpdate();
    await formDelete();
    await formUserDelete();
    await formUserRegister();



};

  const tableLinkStyle = {
    color: 'blue',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  return (
    <>
      <Container className='mt-5 center col ' style={{ maxWidth: "1600px" }}>
         <div className="container-fluid">
          <div className="row">
            <div className="col">
              <h5 className="text-center mt-5 " style={{fontSize:"xx-large "}}>
                CENTRE DE GESTION AGREE <span style={{color:"blue",fontWeight: 'bold', }}>LA VOIX DU BARMAN</span> Agrément  <br/>N° 00000596/MINFI/DGI/LRI/CSR du 23 nov 2022.
              </h5>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', backgroundImage: `url('/logo512.png')`, backgroundRepeat: "no-repeat", backgroundSize: "cover", padding: '80px', marginBottom: "20px" }}>
          <span></span>


     

        </div>
        <Row>
          <Col>
            <Nav tabs>
              <NavItem>
                <NavLink
                  style={tableLinkStyle}
                  className={{ active: activeTab === '1' }}
                  onClick={() => toggle('1')}
                >
                  Ajout d'un Contribuable
                </NavLink>
              </NavItem>

              {userInf && (userInf.role !== "administrateur" && (<>
                <NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '10' }}
                      onClick={() => toggle('10')}
                    >
                      Mon Compte
                    </NavLink>
              </>))}

              {userInf && (userInf.role === "administrateur" || userInf.role === "secretaire" ) &&(
                <>
                  <NavItem>
                    <NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '2' }}
                      onClick={() => toggle('2')}
                    >
                      Tous les Contribualles
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '3' }}
                      onClick={() => toggle('3')}
                    >
                      Recherche
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '4' }}
                      onClick={() => toggle('4')}
                    >
                      Importer xlsx
                    </NavLink>
                  </NavItem>
                  {userInf && (userInf.role === "administrateur") && (
                  <NavItem>
                    <NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '5' }}
                      onClick={() => toggle('5')}
                    >
                      Valider/Invalider
                    </NavLink>
                  </NavItem>
                  )}
                  <NavItem>
                    <NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '6' }}
                      onClick={() => toggle('6')}
                    >
                      DGI
                    </NavLink>
                  </NavItem>

                  
                  <NavItem>
                    <NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '7' }}
                      onClick={() => toggle('7')}
                    >
                    Archives
                    </NavLink>
                    {/* <NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '8' }}
                      onClick={() => toggle('8')}
                    >
                      Mettre à jour 
                    </NavLink> */}
                  </NavItem>
                  <NavItem>
                    <NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '9' }}
                      onClick={() => toggle('9')}
                    >
                      <img style={{color:"blue"}} src='./icons/menu.svg' alt="menu" />
                    </NavLink>
                  </NavItem>
                </>
              )}
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <div className='text-center'>
                  { message && (<h4 style={{ color: 'green' }}>{message}</h4>)}
                  {statut && (<h4 style={{ color: "mediumvioletred" }}>{statut}</h4>)}
                  {messagerr && (<><div style={{color:'red'}}><h3>{messagerr}</h3></div></>)}
                </div>
                <RegistrationForm />
              </TabPane>
              <TabPane tabId="2">
                <ListContrib />
              </TabPane>
              <TabPane tabId="3">
                <SearchForm />
              </TabPane>
              <TabPane tabId="4">
                <ListPage />
              </TabPane>
              <TabPane tabId="5">
                <ValidateContrib />
              </TabPane>
              <TabPane tabId="6">
                <DgiCompare />
              </TabPane>
              <TabPane tabId="7">
                <DgiCompare />
              </TabPane>

              <TabPane tabId="8">
               <RenewForm />
              </TabPane>
              <TabPane tabId="9">
                <div className='text-center '>
                {message && (<><h4 style={{color:"mediumvioletred" }}>{message}</h4></>) }

                <div class="list-group">
                <span href="#"  data-toggle="modal"  style={{cursor:"pointer"}} data-target="#userRegister" class="list-group-item list-group-item-action ">
                Ajouter un utilisateur
                </span>

                    <div className="modal fade" id="userRegister" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                      <div className="modal-dialog" role="document">
                        <div className="modal-content container mt-5" style={{position:'absolute', width:'400px'}}>
                          <div className="modal-header">
                            <h5 className="modal-title">Entrez ses informations</h5>
                            <button type="button" className="close"  data-dismiss="modal" aria-label="Close">
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
                <span href="#" class="list-group-item list-group-item-action" data-toggle="modal" data-target="#changePassword" style={{cursor:"pointer"}}  >Changer le mot de passe</span>

                    <div className="modal fade" id="changePassword" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                          <div className="modal-dialog" role="document">
                            <div className="modal-content container mt-5" style={{position:'absolute', width:'400px'}}>
                              <div className="modal-header">
                                <h5 className="modal-title">Entrez ses informations</h5>
                                <button type="button" className="close"  data-dismiss="modal" aria-label="Close">
                                  <span aria-hidden="true">&times;</span>
                                </button>
                              </div>
                              <div className="modal-body row">
                                {/* Champ de fichier XLS */}
                                {message && (<><h4 style={{color:"green" }}>{message}</h4></>) }
                                <ReneWPassword />
                              </div>
                              <div className="modal-footer">
                              </div>
                            </div>
                          </div>
                        </div>
                <span href="#" class="list-group-item list-group-item-action text-danger" style={{cursor:"pointer"}} onClick={deleteAllConrib}>Supprimer tous les contribuables</span>
                <span href="#" class="list-group-item list-group-item-action btn-danger text-danger"style={{cursor:"pointer"}} onClick={renewComtrib} >Mettre le paiement de tout le monde à 0F</span>
                <span href="#" class="list-group-item list-group-item-action"style={{cursor:"pointer"}}  data-toggle="modal" data-target="#userManage" >Gestion des utilisateurs</span>

                        <div className="modal fade" id="userManage" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                          <div className="modal-dialog" role="document">
                            <div className="modal-content container mt-5" style={{position:'absolute', width:"max-content"}}>
                              <div className="modal-header">
                                <h5 className="modal-title">Utilisateurs:</h5>
                                <button type="button" className="close"  data-dismiss="modal" aria-label="Close">
                                  <span aria-hidden="true">&times;</span>
                                </button>
                              </div>
                              <div className="modal-body row">
                                {/* Champ de fichier XLS */}
                                {message && (<><h4 style={{color:"green" }}>{message}</h4></>) }
                                <UserManage />
                              </div>
                              <div className="modal-footer">
                              </div>
                            </div>
                          </div>
                        </div>
                <span href="#" class="list-group-item list-group-item-action "  disabled={pending2} onClick={handleExport} style={{cursor:"pointer"}} > 
                {pending2 && <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                  Exporter la liste de contribuables                  
                </span>
              </div>
                </div>
              </TabPane>


              <TabPane tabId="10">
                <div className='text-center '>
                {message && (<><h4 style={{color:"mediumvioletred" }}>{message}</h4></>) }

                <div class="list-group">
                
                <span href="#" class="list-group-item list-group-item-action" data-toggle="modal" data-target="#changePassword2" style={{cursor:"pointer"}}  >Changer mon mot de passe</span>

                    <div className="modal fade" id="changePassword2" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                          <div className="modal-dialog" role="document">
                            <div className="modal-content container mt-5" style={{position:'absolute', width:'400px'}}>
                              <div className="modal-header">
                                <h5 className="modal-title">Entrez ses informations</h5>
                                <button type="button" className="close"  data-dismiss="modal" aria-label="Close">
                                  <span aria-hidden="true">&times;</span>
                                </button>
                              </div>
                              <div className="modal-body row">
                                {/* Champ de fichier XLS */}
                                {message && (<><h4 style={{color:"green" }}>{message}</h4></>) }
                                <ReneWPassword />
                              </div>
                              <div className="modal-footer">
                              </div>
                            </div>
                          </div>
                        </div>
              </div>
                </div>
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default MultipleNavTables;