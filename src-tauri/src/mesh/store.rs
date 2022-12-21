use app::protobufs;
use redux_rs::Selector;
use std::collections::HashMap;

#[derive(Default, Debug)]
pub struct MessagesState {
    messages: HashMap<u32, protobufs::Data>,
}

#[derive(Clone, Debug)]
pub enum MessagesActions {
    AddMessage { id: u32, data: protobufs::Data },
}

pub fn message_reducer(mut state: MessagesState, action: MessagesActions) -> MessagesState {
    match action {
        MessagesActions::AddMessage { id, data } => MessagesState {
            messages: {
                state.messages.insert(id, data);
                state.messages
            },
            ..state
        },
    }
}

pub struct SelectAllMessages;
impl Selector<MessagesState> for SelectAllMessages {
    type Result = Vec<protobufs::Data>;

    fn select(&self, state: &MessagesState) -> Self::Result {
        state.messages.iter().map(|e| e.1.to_owned()).collect()
    }
}
