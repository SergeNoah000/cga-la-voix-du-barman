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

const MultipleNavTables = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [userInf, setUserInf] = useState([]);
  
  const navigateTo = useNavigate();

  const url = new URL(window.location.href);
  const domainName = url.hostname.replace(/^www\./, '');

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  }

  useEffect(() => {
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
          console.log(userInfo);
        }
      } else {
        navigateTo('/login');
      }
    } catch (err) {}
  }

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
              <h5 className="text-center mt-5 ">
                CENTRE DE GESTION AGREE <span style={{color:"blue",fontWeight: 'bold', }}>LA VOIX DU BARMAN</span> Agrément n° 00000596/MINFI/DGI/LRI/CSR du 23 nov 2022.
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
                    {/*<NavLink
                      style={tableLinkStyle}
                      className={{ active: activeTab === '8' }}
                      onClick={() => toggle('8')}
                    >
                      ajout utilisateur
                    </NavLink>*/}
                  </NavItem>
                </>
              )}
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
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
              <Register />
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default MultipleNavTables;