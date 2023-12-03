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
              <img src="/logo512.png" alt="logo" width="100" />
            </div>
            <div className="card shadow-lg">
              <div className="card-body p-5">
                <h1 className="fs-4 card-title fw-bold mb-4">Forgot Password</h1>
                <form onSubmit={handleSubmit} className="needs-validation" noValidate autoComplete="off">
                  <div className="mb-3">
                    <label className="mb-2 text-muted" htmlFor="email">
                      E-Mail Address
                    </label>
                    <input id="email" type="email" className="form-control" name="email" value="" required autoFocus />
                    <div className="invalid-feedback">Email is invalid</div>
                  </div>

                  <div className="d-flex align-items-center">
                    <button type="submit" className="btn btn-primary ms-auto">
                      Send Link
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer py-3 border-0">
                <div className="text-center">
                  Remember your password? <Link to="/login" className="text-dark">Login</Link>
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
