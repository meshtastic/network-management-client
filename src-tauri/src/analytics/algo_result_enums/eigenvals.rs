#[derive(Debug)]
pub enum EigenvalsResult {
    Success(Vec<f64>),
    Error(String),
    Empty(bool),
}

impl Clone for EigenvalsResult {
    fn clone(&self) -> Self {
        match self {
            EigenvalsResult::Success(eigenvals) => EigenvalsResult::Success(eigenvals.clone()),
            EigenvalsResult::Error(err) => EigenvalsResult::Error(err.clone()),
            EigenvalsResult::Empty(empty) => EigenvalsResult::Empty(*empty),
        }
    }
}
