#include "MobileDevice.h"
#include <iostream>

namespace {
    int clampBattery(int b) {
        if (b < 0)   return 0;
        if (b > 100) return 100;
        return b;
    }
}

MobileDevice::MobileDevice(const std::string& n, int b)
    : Device(n), battery(clampBattery(b)) {}

MobileDevice::MobileDevice(int id, const std::string& n, int b)
    : Device(id, n), battery(clampBattery(b)) {}

void MobileDevice::print() const {
    std::cout << "[mobile] name: \"" << getName()
              << "\", ID: " << getId()
              << ", battery: " << battery << "%\n";
}

Device* MobileDevice::clone() const {
    return new MobileDevice(*this);  // copy keeps the same ID
}

void MobileDevice::writeFields(std::ostream& os) const {
    os << battery;
}
