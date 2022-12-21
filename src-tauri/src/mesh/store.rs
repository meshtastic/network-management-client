extern crate lru;

use lru::LruCache;
use redux_rs::Selector;
use std::num::NonZeroUsize;

use app::protobufs;

#[derive(Debug)]
pub struct MessagesState {
    messages: LruCache<u32, protobufs::Data>,
}

impl Default for MessagesState {
    fn default() -> Self {
        return MessagesState {
            messages: LruCache::new(
                NonZeroUsize::new(64)
                    .expect("Error creating non-zero usize in LRU default initialization"),
            ),
        };
    }
}

#[derive(Clone, Debug)]
pub enum MessagesActions {
    AddMessage { id: u32, data: protobufs::Data },
}

pub fn message_reducer(mut state: MessagesState, action: MessagesActions) -> MessagesState {
    match action {
        MessagesActions::AddMessage { id, data } => MessagesState {
            messages: {
                state.messages.put(id, data);
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
