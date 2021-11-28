//create variable to hold db connection 
let db;
//establish a connection to IndexedDb database 
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
    if(navigator.onLine) {
        uploadTransaction();
    }
}

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transObjectStore = transaction.objectStore('new_transaction');
    transObjectStore.add(record);
}

function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transObjectStore = transaction.objectStore('new_transaction');
    const getAll = transObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST', 
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json)
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const transObjectStore = transaction.objectStore('new_transaction');
                transObjectStore.clear();
                alert('All transactions have been submitted!');
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}

//listen for app to come back online
window.addEventListener('online', uploadTransaction);