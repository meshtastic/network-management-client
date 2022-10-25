import java.util.*;

class Node<T> {
    Queue<T> queue;
    boolean isRemoved;

    // Constructor
    public Node() {
        this.queue = new LinkedList<T>();
        this.isRemoved = false;
    }

    // Comparator
    public int compareTo(Node<T> node) {
        return this.queue.size() - node.queue.size();
    }

    // Add element to queue
    public void add(T element) {
        this.queue.add(element);
    }

    // Remove element from queue
    public T remove() {
        return this.queue.remove();
    }

    // Get size of queue
    public int size() {
        return this.queue.size();
    }

    // Peek element from queue
    public T peek() {
        return this.queue.peek();
    }

    // Copy node
    public Node<T> copy() {
        Node<T> node = new Node<T>();
        node.queue = new LinkedList<T>(this.queue);
        node.isRemoved = this.isRemoved;
        return node;
    }
}

public class BankBranch<T> {
    PriorityQueue<Node<T>> tellers;
    List<Node<T>> tellerList;
    public BankBranch(int number_of_tellers) {
        // For each i from 0 to number_of_tellers,
        // create a new queue and add it to the array.
        this.tellerList = new ArrayList<Node<T>>(number_of_tellers);
        this.tellers = new PriorityQueue<Node<T>>(number_of_tellers);

        for (int i = 0; i < number_of_tellers; i++) {
            Node<T> node = new Node<T>();
            this.tellers.insert(node);
            this.tellerList.add(node);
        }
        
    }

    public void addCustomer(T customerRecord) {
        // Add the customer to the shortest queue.
        ArrayList<Node<T>> addBack = new ArrayList<Node<T>>();
        // This will clean up the front of the priority queue
        // so that the queues at earlier times are discarded
        // from the front.
        while (this.tellers.minimum().isRemoved) {
            this.tellers.remove();
        }
        Node<T> shortestQueue = this.tellers.remove();
        shortestQueue.add(customerRecord);
        this.tellers.insert(shortestQueue);
    }

    public T nextCustomer(int tellerNumber) {
        // Return the next customer in the queue for the given teller.
        // The priority queue will contain queues at different times.
        // This helps us with "updating" queues in addCustomer() method.
        Node<T> node = this.tellerList.get(tellerNumber);
        Node<T> updatedNode = node.copy();
        node.isRemoved = true;
        this.tellers.insert(updatedNode);
        this.tellerList.set(tellerNumber, updatedNode);
        if (updatedNode.size() > 0) {
            T firstCustomer = updatedNode.remove();
            return firstCustomer;
        } else {
            return null;
        }
    }

    public String toString() {
        int currLine = 0;
        StringBuilder output = new StringBuilder();
        output.append("Line " + currLine + ": ");
        for (Node<T> node : this.tellerList) {
            output.append("Line " + currLine + "\n");
            output.append("\t Number waiting: " + node.size() + "\n");
            if (node.size() > 0) {
                output.append("\t Next customer: " + node.peek() + "\n");
            } else {
                output.append("\t Empty\n");
            }
            currLine++;
        }
    }
}