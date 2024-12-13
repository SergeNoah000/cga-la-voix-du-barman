import React from 'react';
import { Link } from 'react-router-dom';
const ForgotPassword = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Ajoutez votre logique de gestion de la soumission du formulaire ici
  };

  return (
    <section className="h-100">
      <div className="container h-100">
        <div className="row justify-content-sm-center h-100">
          <div className="col-xxl-4 col-xl-5 col-lg-5 col-md-7 col-sm-9">
            <div className="text-center my-5">
              <img src="/log512.png" alt="logo" width="300" />
            </div>
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <h1 className="fs-4 card-title mb-4">Veuillez contacter l'administrateur (le président du CGA) et lui demander de modifier votre mot de passe</h1>
                
              </div>
              <div className="card-footer py-3 border-0">
                <div className="text-center">
                  Vous vous souvenez du mot de passe ? <Link to="/login" className="text-blue">Connectez-vous.</Link>
                </div>
              </div>
            </div>
            <div className="text-center mt-5 text-muted">
              Copyright &copy; 2017-2023 &mdash; CGA La Voix du Barman
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
