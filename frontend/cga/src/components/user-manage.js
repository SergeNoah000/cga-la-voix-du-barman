


import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Spinner } from 'react-bootstrap';
import UserDetails from "./user-details";

const UserManage = () => {
   const [selectAll, setSelectAll] = useState(false);
   const [users, setUsers] = useState([]);
   const [selectedList, setSelectedList] = useState([]);
   const [loading, setLoading] = useState(false);
   const [selected, setSelected] = useState(null);
   const [messageErr, setMessageErr] = useState('');
   const [message, setMessage] = useState('');
   const [done, setDone] = useState(false);
   const [pending, setPending] = useState(false);

   const fetchUsers = async () => {
      try {
         setDone(false);
         const formData = new FormData();
         formData.append("api/users/all", "something");
         const response = await axios.post(`https://cga.legionweb.co/cga-server.php`, formData, {
            headers: {
               'Content-Type': 'multipart/form-data'
            }
         });

         setDone(true);
         setUsers(response.data);

         // Stocker les données récupérées en localstorage
         localStorage.setItem('users', JSON.stringify(response.data));
      } catch (error) {
         if (error?.message === "Network Error") {
            // Récupérer les données stockées en localstorage en cas d'erreur de connexion
            const storedData = JSON.parse(localStorage.getItem('users'));
            if (storedData) {
               setUsers(storedData);
               setMessageErr('Données en local non synchronisées');
            }
         } else {
            console.error('Erreur lors du chargement des contribuables :', error);
            setMessageErr(error.message);
         }
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (users.length === 0 || done === false) {
         fetchUsers();
         setDone(true);
      }
   }, [users, messageErr]);

   const handleSelectAll = () => {
      if (selectAll) {
         setSelectedList([]);
      } else {
         const allUserIds = users.map(user => user.id);
         setSelectedList(allUserIds);
      }
      setSelectAll(!selectAll);
   };

   const handleAction = async () => {
    const ch = prompt("Confirmer la suppression de: " + selectedList.length + " utilisateurs? (Oui/Non)");
    if (ch?.toLowerCase() === "oui") { // Utilisez toLowerCase() pour convertir la chaîne en minuscules
      try {
        setPending(true);
        console.log(selectedList);
        const formData = new FormData();
        formData.append("userIdList", JSON.stringify(selectedList));
        formData.append("api/users/delete-list", "something");
        const response = await axios.post(`https://cga.legionweb.co/cga-server.php`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
  
        setPending(false);
        fetchUsers();
        setMessage(response.data.message);
        const id = setTimeout(() => {
          setMessage('');
        }, 4000);
        const cancel = () => {
          clearTimeout(id);
        };
        setTimeout(cancel, 5000);
  
      } catch (error) {
        setPending(false);
        console.error('Erreur lors de la suppression des utilisateurs :', error);
        if (error.message && error.message === "Network Error") {  
          // Stoker les données du formulaire dans le localStorage
          const after = JSON.parse(localStorage.getItem('user-delete'));
          const trans = selectedList.map((item)=>{return {id:item}});
          if (after) {
            after.push(...trans);
            localStorage.setItem('user-delete', JSON.stringify(after));
          } else {
            localStorage.setItem('user-delete', JSON.stringify(trans));
          }
  
          setMessage(" Modification stockée en local en attente d'une connexion internet. ");
          const id = setTimeout(() => {
            setMessage('');
          }, 4000);
          const cancel = () => {
            clearTimeout(id);
          };
          setTimeout(cancel, 5000);
        } else {
          setMessageErr(error.message);
          const id = setTimeout(() => {
            setMessageErr('');
          }, 4000);
          const cancel = () => {
            clearTimeout(id);
          };
          setTimeout(cancel, 5000);
        }
      }
    } else {
      setMessage("Opération annulée");
      const id = setTimeout(() => {
        setMessage('');
      }, 4000);
      const cancel = () => {
        clearTimeout(id);
      };
      setTimeout(cancel, 5000);
      return;
    }
  };

   return (
      <div className="row">
        
         <div className="col">
         {done === false && (
            <div>
               <h3>
                  <Spinner as="span" animation="grow" size="md" role="status" aria-hidden="true" />
                  Chargement en cours.
               </h3>
            </div>
         )}
         {messageErr && (
            <div style={{ color: 'red' }}>
               <h3>{messageErr}</h3>
            </div>
         )}

         {message && (
            <div style={{ color: 'green' }}>
               <h3>{message}</h3>
            </div>
         )}

            <div className="list-group" id="list-tab" role="tablist">
               <div className="form-check mb-3">
                  <input
                     className="form-check-input"
                     type="checkbox"
                     checked={selectAll}
                     onChange={handleSelectAll}
                  />
                  <label className="form-check-label">Sélectionner tout</label>
               </div>
               {users && users.length > 0 && users.map((user, ind) => (
                  <label
                     className={`${selected === ind || selectedList.includes(user.id) ? "list-group-item list-group-item-action active" : "list-group-item list-group-item-action"}`}
                     style={{ cursor: "pointer" }}
                     onClick={() => { setSelected(ind) }}
                     data-bs-toggle="list"
                     href={"#list-home"+user.id}
                     role="tab"
                     aria-controls="list-home"
                  >
                     <input
                        id={"checked" + user.id}
                        className="form-check-input me-1"
                        type="checkbox"
                        checked={selectedList.includes(user.id)}
                        onChange={(e) => {
                           const checked = e.target.checked;
                           const id = user.id;
                           if (checked) {
                              setSelectedList([...selectedList, id]);
                           } else {
                              setSelectedList(selectedList.filter(item => item !== id));
                           }
                        }}
                     />
                     {user.username}
                  </label>
               ))}
            </div>
        
      {selectedList.length === 1 && (
         <div className="col">
            <div className="tab-content" id="nav-tabContent">
               {users && users.length > 0 && users.map((user, ind) => (
                  <div className={`tab-pane fade ${selected === ind ? "show active" : ""}`} id={"list-home"+user.id} role="tabpanel" aria-labelledby="list-home-list">
                     <UserDetails user={user} />
                  </div>
               ))}
            </div>
         </div>
      )}
         <div className="col-12 mt-3">
            {selectedList.length > 0 && (
               <Button disabled={pending}  variant="danger" onClick={handleAction}>
                  {pending && <Spinner as="span" className="mr-2" animation="border" size="sm" role="status" aria-hidden="true" />}
                  Supprimer la selection
               </Button>
            )}
         </div>
         </div>
      </div>
   );
};

export default UserManage;