#include <iostream>
using namespace std;

// Function to calculate factorial
int factorial(int n) {
    if (n <= 1) {
        return 1;
    } else {
        return n * factorial(n - 1);
    }
}

int main() {
    int number = 5; // Change this number to calculate factorial for a different number
    int result = factorial(number);
    cout << "Factorial of " << number << " is: " << result << endl;
    return 0;
}
