use crate::aux_data_structures::cut::Cut;

#[derive(Debug)]
pub enum SWCutResult {
    Success(Cut),
    Error(String),
    Empty(bool),
}

impl Clone for SWCutResult {
    fn clone(&self) -> Self {
        match self {
            SWCutResult::Success(sw_cut) => SWCutResult::Success(sw_cut.clone()),
            SWCutResult::Error(err) => SWCutResult::Error(err.clone()),
            SWCutResult::Empty(empty) => SWCutResult::Empty(*empty),
        }
    }
}
