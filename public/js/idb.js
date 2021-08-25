let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (e) {
  const db = e.target.result;
  db.createObjectStore("pendingTransaction", { autoIncrement: true });
};
request.onsuccess = function (e) {
  db = e.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (e) {
  console.log(e.target.errorCode);
};

function save(record) {
  const transaction = db.transaction(["pendingTransaction"], "readwrite");
  const budgetStore = transaction.objectStore("pendingTransaction");

  budgetStore.add(record);
}

function dbStatus() {
  const transaction = db.transaction(["pendingTransaction"], "readwrite");
  const budgetStore = transaction.objectStore("pendingTransaction");
  const getAll = budgetStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(
            ["pendingTransaction"],
            "readwrite"
          );
          const budgetStore = transaction.objectStore("pendingTransaction");
          budgetStore.clear();
        })
        .catch((err) => console.log(err));
    }
  };
}

window.addEventListener("UP", dbStatus);
