#include <iostream>
using namespace std;

class BankAccount {
private:
    double balance;
    string accountNumber;

public:
    BankAccount(string acc, double bal) : accountNumber(acc), balance(bal) {}

    friend class BankManager;
    friend void displayBalance(const BankAccount& acc);
};

class BankManager {
public:
    void transfer(BankAccount& from, BankAccount& to, double amount) {
        if (from.balance >= amount) {
            from.balance -= amount;
            to.balance += amount;
            cout << "Transferred " << amount << " successfully" << endl;
        } else {
            cout << "Insufficient funds" << endl;
        }
    }

    void checkAccount(const BankAccount& acc) {
        cout << "Account " << acc.accountNumber
             << " balance: " << acc.balance << endl;
    }
};

void displayBalance(const BankAccount& acc) {
    cout << "Balance for " << acc.accountNumber << ": " << acc.balance << endl;
}

int main() {
    BankAccount acc1("A001", 5000);
    BankAccount acc2("A002", 3000);
    BankManager manager;

    manager.checkAccount(acc1);
    manager.transfer(acc1, acc2, 1500);
    displayBalance(acc1);
    displayBalance(acc2);
    return 0;
}
