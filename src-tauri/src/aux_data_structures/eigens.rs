use crate::state_err_enums::eigenvals::EigenvalsResult;
use nalgebra::DMatrix;

pub struct Eigens {
    pub eigenvalues: Option<EigenvalsResult>,
    pub eigenvectors: Option<Vec<f64>>,
}

impl Eigens {
    pub fn new() -> Eigens {
        Eigens {
            eigenvalues: None,
            eigenvectors: None,
        }
    }

    pub fn calc_and_set_eigenvals(&mut self, adj_matrix: DMatrix<f64>) {
        let schur = adj_matrix.clone().schur();
        let eigenvalues_option = schur.eigenvalues();

        match eigenvalues_option {
            // If eigenvalues are real, then we can unwrap them
            Some(eigenvalues) => {
                let eigenvalues_vec: Vec<f64> = eigenvalues.data.as_vec().clone();
                self.eigenvalues = Some(EigenvalsResult::Success(eigenvalues_vec));
            }
            None => {
                self.eigenvalues = Some(EigenvalsResult::Error(
                    "Eigenvalues are not real.".to_string(),
                ));
            }
        }
    }

    pub fn get_eigenvals_or_err(&self) -> Option<EigenvalsResult> {
        match &self.eigenvalues {
            Some(eigenvals) => Some(eigenvals.clone()),
            None => None,
        }
    }
}
