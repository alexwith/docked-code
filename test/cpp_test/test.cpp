// Your First C++ Program

#include <iostream>
#include "person.h"

int main() {
    Person person;
    person.age = 10;
    std::cout << person.age;
    return 0;
}